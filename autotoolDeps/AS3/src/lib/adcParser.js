/**
 * Copyright 2022 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const AJV = require('ajv');
const f = require('fs');
const log = require('./log');
const parserFormats = require('./adcParserFormats');
const parserKeywords = require('./adcParserKeywords');
const myValidator = require('./validator');
const util = require('./util/util');
const components = require('./adcParserComponents');
const PostValidator = require('./postValidator');
const Config = require('./config');

const secrets = require('./adcParserSecrets');
const fetches = require('./adcParserFetch');
const certUtil = require('./util/certUtil');

const DEVICE_TYPES = require('./constants').DEVICE_TYPES;

class As3Parser {
    constructor(deviceType, schemaPath) {
        this.deviceType = deviceType;
        this.defaultSchemaSource = schemaPath || 'file:///var/config/rest/iapps/f5-appsvcs/schema/latest/adc-schema.json';
        this.parsed = undefined; // most-recently-parsed declaration
        this.schema = undefined; // schema used with this.parsed
        this.nodelist = [];
        this.virtualAddressList = [];
        this.validator = undefined;
        this.options = {};
    }

    /**
     * return a promise to compile a schema for use by
     * digest().  If supplied, argument 'source' is an
     * AS3 schema (as an object) or else a filename or URL
     * (file:/http(s):) from which to load an AS3 schema,
     * if undefined or "" we load the default AS3 schema
     *
     * @public
     * @param {object|string} source - if not empty overrides default schema
     * @param {string} [saveCache=no] - refresh ajv-async-code cache file?
     * @returns {Promise} - resolves to schema's "$id" value
     */
    loadSchema(source) {
        // first get an AJV instance with our custom keywords, etc.
        const ajv = prepareParserAjv.call(this);

        let schemaURL = '';
        const R_OK = (typeof f.R_OK === 'undefined') ? f.constants.R_OK : f.R_OK;

        // did caller supply actual schema or a URL to schema?
        if ((typeof source === 'object') && (source !== null)
            && Object.prototype.hasOwnProperty.call(source, '$id')) {
            // caller provided a schema
            this.schema = source;
        } else if ((typeof source === 'undefined')
                || ((typeof source === 'string')
                                            && (source === ''))) {
            // caller wishes to use default schema
            schemaURL = this.defaultSchemaSource;
        } else if ((typeof source === 'string')
                && (source.match(/^(https?|file):/)
                    || (f.accessSync(source, R_OK) === undefined))) {
            schemaURL = source;
        } else {
            return Promise.reject(new Error('loadSchema argument must be schema, URL, or filename'));
        }

        if (typeof this.schema === 'undefined') {
            // must fetch schema from URL
            const loadOpts = {
                why: 'for schema',
                timeout: this.targetTimeout
            };

            return util.loadJSON(schemaURL, loadOpts)
                .then((s) => {
                    if (!Object.prototype.hasOwnProperty.call(s, '$id')) {
                        throw new Error(`${schemaURL} did not return an AS3 schema`);
                    }

                    this.schema = s;

                    // compile schema to AJV validation function
                    // (which returns Promise, because async mode)
                    try {
                        this.validator = ajv.compile(this.schema);
                    } catch (e) {
                        e.message = `compiling schema ${schemaURL
                        } failed, error: ${e.message}`;
                        log.error(e);
                        this.validator = undefined;
                        throw e;
                    }

                    return this.schema.$id;
                })
                .catch((e) => {
                    e.message = `loading schema failed, error: ${e.message}`;
                    log.error(e);
                    throw e;
                });
        }

        // compile schema to AJV validation function
        try {
            this.validator = ajv.compile(this.schema);
        } catch (e) {
            e.message = `compiling supplied schema failed, error: ${e.message}`;
            log.error(e);
            return Promise.reject(e);
        }

        return Promise.resolve(this.schema.$id); // success
    }

    /**
     * Checks the declaration to ensure that full paths will not
     * exceed the tmsh max length.
     */
    validatePathLength(declaration) {
        const tenants = Object.keys(declaration).filter((key) => declaration[key].class
            && declaration[key].class === 'Tenant');
        tenants.forEach((tenant) => {
            const applications = Object.keys(declaration[tenant]).filter((key) => declaration[tenant][key].class
                && declaration[tenant][key].class === 'Application');
            applications.forEach((application) => {
                Object.keys(declaration[tenant][application]).forEach((item) => {
                    const path = `/${tenant}/${application}/${item}`;
                    if (path.length > 255) {
                        const e = new Error();
                        e.message = `The path /${tenant}/${application
                        }/${item} exceeds the 255 full path character limit`;
                        e.status = 400;
                        throw e;
                    }
                });
            });
        });
    }

    /**
     * given a declaration, return a promise to digest
     * it according to the current schema (chosen with
     * loadSchema()).  Has the HUGE SIDE-EFFECT of
     * modifying declaration!
     *
     * An adcParser needs to know how to contact the
     * target BIG-IP so it can validate BIG-IP config
     * component references and obtain SecureVault
     * cryptograms for customer secrets.  The required
     * info should be in parameter 'context.control'.
     *
     * @public
     * @param {Object} context - full context object containing sub-contexts
     * @param {Object} context.control - control object contained within context
     * @param {Object} declaration - raw declaration to cook (WILL BE MODIFIED)
     * @param {Object} [options] - optional parameters
     * @param {Object} [options.baseDeclaration] - original request declaration with no
     *                                             modifications (WILL BE MODIFIED)
     * @param {Boolean} [options.copySecrets=false] - copy sv cryptograms to baseDeclaration
     * @param {Object} [options.previousDeclaration] - the previous saved declaration
     * @returns {Promise} - resolves to declaration label+id (declaration is MODIFIED)
     */
    digest(context, declaration, options) {
        const defaultOpts = {
            copySecrets: false,
            baseDeclaration: {},
            previousDeclaration: {}
        };
        this.options = Object.assign(this.options, defaultOpts, options);
        this.secrets = [];
        this.longSecrets = [];
        this.components = [];
        this.fetches = [];

        if (typeof this.validator === 'undefined') {
            // someone didn't call loadSchema() or didn't notice it failed
            return Promise.reject(new Error('loadSchema() required before digest()'));
        }
        if ((typeof declaration !== 'object') || (declaration === null)) {
            return Promise.reject(new Error('digest() requires declaration'));
        }
        this.context = context;

        // TODO: Update as3Digest() to receive 'context' instead of 'this'
        // return as3Digest.call(this, declaration) --> return as3Digest(context, declaration)
        return as3Digest.call(this, declaration)
            .then((id) => {
                log.debug(`success parsing declaration ${id}`);
                return id;
            });
    }
}

// We call a reference from one property within a
// declaration to another an "AS3 pointer" and convert it
// to a JSON pointer from the root before dereferencing
// it.  We provide several sweeteners:  a pointer may
// be an absolute or relative JSON pointer; may be
// relative to the /T/A it was found in; may be
// relative to its nearest "classy" ancestor; and
// finally may "pull tokens in" from the pointer to
// the source of the pointer.  That last is easier to
// use than to describe:  when a reference token in
// a pointer is simply '@', we replace it with the
// corresponding (same depth) reference token from
// the pointer to the nominal source of the pointer.
// So if we obtain the pointer "/@/Shared/mypool" from
// the property "/T1/A1/serviceMain" then we convert the
// pointer to "/T1/Shared/mypool" before dereferencing
// it.  Similar uses are also valid.  For example,
// pointer "/Common/@/mypool" from "/T1/A1/serviceMain"
// converts to "/Common/A1/mypool".  Note, however,
// that we forbid any pointer which points outside of
// the /T/A in which it was found except when it
// points into /T/Shared or /Common/Shared.

/**
 * return a handle to an instance of ajv to
 * which our custom formats and keywords have
 * been added.
 *
 * We utilize the excellent 'ajv' tool from
 *
 *      http://epoberezkin.github.io/ajv/
 *
 * to validate AS3 declarations against our AS3
 * JSON Schema and to drive a bunch of features
 * controlled by custom schema keywords
 *
 * @private
 * @returns {object}
*/

function prepareParserAjv() {
    const ajvOptions = {
        allErrors: false,
        verbose: true,
        useDefaults: this.deviceType !== DEVICE_TYPES.BIG_IQ,
        jsonPointers: true,
        async: true
    };

    const ajv = new AJV(ajvOptions);

    // Add AS3 custom string formats
    parserFormats.forEach((format) => ajv.addFormat(format.name, format.check));

    //
    // Add AS3 custom keywords
    //
    // (AJV custom keyword execution order:
    //      https://github.com/epoberezkin/ajv/issues/578 )
    //
    parserKeywords.keywords.forEach((keyword) => ajv.addKeyword(keyword.name,
        keyword.definition(this)));

    return ajv;
}

function validate(declaration) {
    const parserTime = new Date();
    let id = declaration.id;

    // what is the ID of this declaration?
    if (!Object.prototype.hasOwnProperty.call(declaration, 'id')
        || (!id.match(/^[^\x00-\x20\x22'<>\x5c^`|\x7f]{0,255}$/))) {
        const error = new Error('declaration lacks valid \'id\' property');
        error.status = 422;
        return Promise.reject(error);
    }
    if (Object.prototype.hasOwnProperty.call(declaration, 'label')
        && (declaration.label.match(/^[^\x00-\x1f\x22#&*<>?\x5b-\x5d`\x7f]{1,48}$/))) {
        id = `id ${id}|${declaration.label.replace(/'/g, '.')}`;
    } else {
        id = `id ${id}`;
    }
    log.debug(`validating declaration having ${id}`);

    if (this.validator === undefined) {
        return Promise.reject(new Error('validation requires loaded schema'));
    }

    return Promise.resolve()
        .then(() => this.validator(declaration))
        .then((valid) => {
            if (!valid) throw new AJV.ValidationError(this.validator.errors);
            const certErrors = certUtil.validateCertificates(declaration, []);
            if (!util.isEmptyOrUndefined(certErrors)) throw new AJV.ValidationError(certErrors);
        })
        .then(() => this.validatePathLength(declaration))
        .then(() => {
            const result = myValidator.hasDuplicate(declaration);
            log.notice(`Parser time: ${new Date() - parserTime} milliseconds`);
            if (result.isDuplicate) {
                log.warning({
                    status: 422,
                    message: 'declaration is invalid',
                    errors: `declaration has duplicate values in ${result.propName}`
                });
                const errorMessage = new Error(`declaration has duplicate values in ${result.propName}`);
                errorMessage.status = 422;
                throw errorMessage;
            }
            log.debug('declaration is valid');
            return id;
        });
}

/**
 * Return a promise to digest a declaration using
 * validator() (that is, validating declaration
 * and processing custom keywords, which m have
 * substantial side effects like fetching lots of
 * data from url's in decl).
 * Resolves to ID of expanded declaration, but has
 * a HUGE side-effect of modifying declaration!
 *
 * @param {object} declaration - AS3 declaration to digest, WILL BE MODIFIED!
 * @returns {Promise} - resolves to "id" of declaration (declaration is MODIFIED)
*/
function as3Digest(declaration) {
    let id;
    let getNodelist = Promise.resolve([]);
    let getVirtualAddresses = Promise.resolve([]);
    if (!declaration.scratch) {
        getNodelist = util.getNodelist(this.context);
        getVirtualAddresses = util.getVirtualAddressList(this.context);
    }

    return getNodelist
        .then((nodelist) => { this.nodelist = nodelist; })
        .then(() => getVirtualAddresses)
        .then((virtualAddressList) => { this.virtualAddressList = virtualAddressList.filter((address) => address.partition === 'Common'); })
        .then(() => Config.getAllSettings())
        .then((settings) => { this.settings = settings; })
        .then(() => validate.call(this, declaration))
        .then((result) => {
            id = result;
        })
        .then(() => PostValidator.validate(this.context, declaration))
        .then(() => secrets.handleSecrets(this.context, this.secrets))
        .then(() => secrets.handleLongSecrets(this.context, this.longSecrets))
        .then(() => {
            if (this.options.copySecrets && this.options.baseDeclaration) {
                copySecrets(declaration, this.options.baseDeclaration);
            }
        })
        .then(() => {
            if (this.deviceType === DEVICE_TYPES.BIG_IQ) {
                return Promise.resolve();
            }
            return fetches.handleFetch(this, this.fetches)
                .then(() => components.handleComponents(this.context, this.components));
        })
        .then(() => id)
        .catch((e) => {
            if (e instanceof AJV.ValidationError) {
                const errs = [];
                let maxerrs = 1; // adjust to show more of error stack

                // TODO:  should we use ajv.errorsText(e) ?
                //
                e.errors.forEach((err) => {
                    maxerrs -= 1;
                    if (maxerrs < 0) {
                        return;
                    }

                    errs.push(util.formatAjvErr(err));
                });

                return Promise.reject(log.warning({
                    status: 422,
                    message: 'declaration is invalid',
                    errors: errs
                }));
            }
            log.warning(`unable to digest declaration. Error: ${e.message}`);
            throw e;
        });
}

/**
 * replace mini-JWE's in object tree d(estination)
 * (typically part of declaration) with the
 * corresponding ones from s(ource).  Return
 * d(estination) (modified in place!)
 * Note: calls itself recursively
 *
 * @public
 * @param {object} s - source object
 * @param {object} d - destination object
 * @returns {undefined}
 */
function copySecrets(s, d) {
    let i;
    let p;

    if ((typeof d !== 'object') || (d === null)
        || (typeof s !== 'object') || (s === null)) {
        return;
    }

    const redacted = '<redacted>';

    if (Object.prototype.hasOwnProperty.call(d, 'method') && d.method === 'bearer-token') {
        d.token = s.token;
        return;
    }

    if (Object.prototype.hasOwnProperty.call(d, 'ciphertext')) {
        d.ciphertext = s.ciphertext;
        d.protected = s.protected;
        d.miniJWE = s.miniJWE;
        return;
    }
    // AWS credentials
    if (Object.prototype.hasOwnProperty.call(d, 'secretAccessKey')) {
        d.secretAccessKey = s.secretAccessKey;
        d.accessKeyId = redacted;
        return;
    }
    // Azure credentials
    if (Object.prototype.hasOwnProperty.call(d, 'apiAccessKey')) {
        d.apiAccessKey = s.apiAccessKey;
        d.resourceGroup = redacted;
        d.subscriptionId = redacted;
        d.directoryId = redacted;
        d.applicationId = redacted;
        return;
    }
    // GCE credentials
    if (Object.prototype.hasOwnProperty.call(d, 'encodedCredentials')) {
        d.encodedCredentials = s.encodedCredentials;
        return;
    }
    // Consul credentials
    if (d.encodedToken) {
        d.encodedToken = s.encodedToken;
        return;
    }
    if (Array.isArray(d)) {
        d.forEach((elem, idx) => {
            if ((typeof elem !== 'object') || (elem === null)
                 || (typeof s[idx] !== 'object') || (s[idx] === null)) {
                return;
            }
            copySecrets(s[idx], d[idx]);
        });
        return;
    }
    const props = Object.keys(d);
    for (i = 0; i < props.length; i += 1) {
        p = props[i];
        if ((typeof d[p] === 'object') && (d[p] !== null)
             && (typeof s[p] === 'object') && (s[p] !== null)) {
            copySecrets(s[p], d[p]);
        }
    }
}

module.exports = As3Parser;
