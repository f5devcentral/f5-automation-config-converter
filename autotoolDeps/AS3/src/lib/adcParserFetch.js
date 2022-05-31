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

const fs = require('fs');
const log = require('./log');
const util = require('./util/util');
const authHeaderUtil = require('./util/authHeaderUtil');
const extractUtil = require('./util/extractUtil');
const expandUtil = require('./util/expandUtil');

/**
 * given 'targetData' taken from pointer 'dataPath' in object
 * 'parent' in declaration 'root', if targetData is an
 * object like F5string, return a promise to fetch
 * some data from the indicated source and stick
 * it into dest[dest_ppty] (which may well replace
 * the parental targetData).  This is async because it
 * may try to fetch an external url.
 *
 * Note:  usually F5string property "base64" is
 * just a string armored to avoid the hassle of
 * JSON-escaping it.  When there actually is
 * binary inside a base64 (pkcs#12, I'm looking
 * at you!) we have to keep it in base64 armor
 *
 * @private
 * @param {object} targetData - object containing a reference to some data
 * @param {string} dataPath - pointer to targetData object
 * @param {object} parent - object in which targetData was found
 * @param {object} dest - object in which referenced-data will be placed
 * @param {string} dest_ppty - property of dest where data will go
 * @param {object} root - root (declaration) object of which parent is descendant
 * @returns {Promise} - resolves to 'true'
 */
function fetchValue(targetData, dataPath, parent, dest, destPpty, root, that, schema) {
    if (typeof targetData !== 'object') {
        return Promise.resolve(true); // nothing to fetch
    }

    // look for F5string-style polymorphism
    // (these properties are mutually exclusive)
    const poly = ['base64', 'url', 'copyFrom', 'reuseFrom', 'include', 'text', 'file'];
    let i;
    let morph = '';
    for (i = 0; i < poly.length; i += 1) {
        if (Object.prototype.hasOwnProperty.call(targetData, poly[i])) {
            morph = poly[i];
            break;
        }
    }
    if (morph === '') {
        return Promise.resolve(true); // nothing to fetch
    }

    let value = '';
    switch (morph) {
    case 'text':
        value = targetData[morph];
        break;
    case 'base64':
        value = util.fromBase64(targetData[morph]);
        break;

    case 'include':
    case 'copyFrom':
    case 'reuseFrom': {
        const rv = {};
        try {
            extractUtil.getAs3Object(
                targetData[morph],
                dataPath.concat('/', morph),
                parent,
                root,
                true,
                rv,
                'ptr',
                ((morph === 'copyFrom') ? 'string' : 'object'),
                rv,
                'val'
            );
            if (rv.ptr === '') {
                return Promise.reject(new Error(`${targetData[morph]} points nowhere`));
            }
        } catch (e) {
            return Promise.reject(new Error(`contains invalid ${morph} (${e.message})`));
        }
        value = rv.val;
        break;
    }
    case 'file': {
        return new Promise((resolve, reject) => {
            fs.readFile((targetData.file), 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                dest[destPpty] = data.toString();
                resolve(true);
            });
        });
    }
    case 'url': {
        let mtype;
        let cset = '';

        const urlObj = Object.assign(
            { skipCertificateCheck: false },
            typeof targetData.url === 'string' ? { url: targetData.url } : targetData.url
        );

        const splitPath = dataPath.split('/');
        const prevDecl = that.options.previousDeclaration;
        if (urlObj.ignoreChanges && prevDecl && prevDecl[splitPath[1]]
            && prevDecl[splitPath[1]][splitPath[2]] && prevDecl[splitPath[1]][splitPath[2]][splitPath[3]]) {
            if (!targetData.ignoreChanges) {
                dest.ignoreChanges = true;
            }
            return Promise.resolve(true);
        }

        switch (schema) {
        case 'string':
            mtype = 'text/plain,'
                            + 'text/csv;q=0.2';
            cset = 'utf-8,us-ascii;q=0.9,iso-8859-1;q=0.2';
            break;

        case 'json':
        case 'object':
            mtype = 'application/json,'
                            + 'text/plain;q=0.2';
            cset = 'utf-8,us-ascii;q=0.9';
            break;

        case 'xml':
            mtype = 'application/xml,'
                            + 'application/xhtml+xml;q=0.5,'
                            + 'text/plain;q=0.2';
            cset = 'utf-8,us-ascii;q=0.9,iso-8859-1;q=0.2';
            break;

        case 'pkcs12':
            mtype = 'application/x-pkcs12,'
                            + 'application/octet-stream';
            break;
        case 'binary':
            mtype = 'application/octet-string';
            break;

        case 'pki-cert':
        case 'pki-bundle':
            mtype = 'application/x-pem-file,'
                            + 'application/pkix-cert;q=0.7,'
                            + 'application/pkcs-mime;q=0.7,'
                            + 'application/x-x509-ca-cert;q=0.7,'
                            + 'application/x-pkcs7-certificates;q=0.5,'
                            + 'application/x-pkcs12;q=0.3,'
                            + 'text/plain;q=0.2,'
                            + 'application/octet-stream;q=0.2';
            break;

        case 'pki-key':
            mtype = 'application/x-pem-file,'
                            + 'application/pkcs8;q=0.5,'
                            + 'application/x-pkcs12;q=0.3,'
                            + 'text/plain;q=0.2,'
                            + 'application/octet-stream;q=0.2';
            break;

        default:
            throw new Error(`unimplemented schema=${schema} in fetchValue()`);
        }

        const hdrs = { Accept: mtype };
        return Promise.resolve()
            .then(() => authHeaderUtil.getAuthHeader(that.context, urlObj.authentication))
            .then((authHeader) => Object.assign(hdrs, authHeader))
            .then(() => util.getExtraHeaders(urlObj))
            .then((extraHeaders) => Object.assign(hdrs, extraHeaders))
            .then(() => {
                if (cset !== '') {
                    hdrs['Accept-Charset'] = cset;
                }

                const timeout = util.getDeepValue(that, `context.tasks.${that.context.currentIndex}.resourceTimeout`);

                const options = {
                    headers: hdrs,
                    timeout,
                    why: (`for ${dataPath}`),
                    rejectUnauthorized: !urlObj.skipCertificateCheck
                };

                return util.httpRequest(urlObj.url, options);
            })
            .then((body) => {
                switch (schema) {
                case 'string':
                case 'json':
                case 'xml':
                    body = body.toString();
                    break;
                case 'binary':
                    body = body.toString('base64');
                    break;
                case 'object':
                    if (typeof body !== 'object') {
                        try {
                            body = JSON.parse(body);
                        } catch (e) {
                            return Promise.reject(new Error(`source ${dataPath}/${morph} does not contain JSON object`));
                        }
                    }
                    break;
                case 'pkcs12':
                    return extractUtil.extractPkcs12(body.toString('base64'), dest, that)
                        .then((pkcs12) => {
                            dest[destPpty] = pkcs12;
                            return true;
                        });
                case 'pki-cert':
                case 'pki-bundle':
                case 'pki-key':
                    if (typeof body !== 'string') {
                        // TODO:  deal with binary cert/key formats
                        // like pkcs#12, pkcs#7

                        body = body.toString(); // TODO: remove this hack
                    }
                    break;

                default:
                    return Promise.reject(new Error(`unimplemented schema=${
                        schema} in fetchValue()`));
                }

                if (schema === 'string' && parent.expand) {
                    expandUtil.backquoteExpand(body, dataPath, parent, root, dest, destPpty);
                } else {
                    dest[destPpty] = body;
                }

                return true;
            })
            .catch((error) => {
                error.message = `Unable to fetch value. ${error.message}`;
                log.error(error.message);
                throw error;
            });
    }
    default:
        // we should not be here
        return Promise.reject(new Error(`contains unsupported polymorphism ${morph}`));
    }

    switch (schema) {
    case 'string':
    case 'json':
    case 'xml':
        value = value.toString();
        break;

    case 'binary':
        value = value.toString('base64');
        break;

    case 'object':
        if (typeof value !== 'object') {
            try {
                value = JSON.parse(value);
            } catch (e) {
                return Promise.reject(new Error(`source ${dataPath}/${morph} does not contain JSON object`));
            }
        }
        break;

    case 'pkcs12':
        return extractUtil.extractPkcs12(value, dest, that)
            .then((pkcs12) => {
                Object.assign(dest, pkcs12);
                return true;
            });
    case 'pki-cert':
    case 'pki-bundle':
    case 'pki-key':
        if (typeof value !== 'string') {
            // TODO:  deal with binary cert/key formats
            // like pkcs#12, pkcs#7

            value = value.toString('base64'); // TODO: remove this hack
        }
        break;

    default:
        return Promise.reject(new Error(`unimplemented schema=${schema} in fetchValue()`));
    }

    if (morph !== 'include') {
        dest[destPpty] = value;
    } else {
        Object.assign(dest, value);
    }

    return Promise.resolve(true);
} // fetchValue()

function handleFetch(that, fetches) {
    return Promise.all(fetches.map((f) => fetchValue(
        f.data, f.dataPath, f.parentData, f.parentData, f.pptyName, f.rootData, that, f.schema
    )));
}

module.exports = {
    handleFetch
};
