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

const util = require('./util/util');
const extractUtil = require('./util/extractUtil');
const expandUtil = require('./util/expandUtil');

const DEVICE_TYPES = require('./constants').DEVICE_TYPES;

const keywords = [
    {
        name: 'f5PostProcess',
        definition: (that) => ({
            metaSchema: {
                type: 'object',
                properties: {
                    tag: {
                        type: 'string',
                        minLength: 1
                    },
                    data: {
                        type: ['string', 'object', 'array']
                    }
                },
                required: ['tag'],
                additionalProperties: false
            },
            validate() {
                const args = Array.from(arguments);
                const schema = args[0];
                let instancePath;
                let parentDataProperty;

                if (typeof args[3] === 'object') {
                    // Fetch data from AJV 7+
                    instancePath = args[3].instancePath;
                    parentDataProperty = args[3].parentDataProperty;
                } else {
                    // Fetch data from AJV 6
                    instancePath = args[3];
                    parentDataProperty = args[5];
                }

                that.postProcess.push({
                    instancePath,
                    parentDataProperty,
                    tag: schema.tag,
                    schemaData: schema.data
                });

                return true;
            }
        })
    },
    {
        // custom keyword 'f5bigComponent' tests whether
        // a named BIG-IP configuration component such as
        // "/Common/fubar" of the required type such as
        // "ltm pool" actually exists.  "Type" in this
        // case refers to TMOS module.  In TMSH and TMGUI
        // the module is always specified separately from
        // the component name, so different components
        // may have identical names.  That means we have
        // to pair up the module from the schema with the
        // component name from the declaration before we
        // can check whether the desired component really
        // exists on the target BIG-IP.  Worse, in some
        // cases (like monitors) we are supposed to know
        // the sub-module before we can list a component,
        // despite the component name being unique across
        // sub-modules.  However, the customer does not
        // specify sub-component and it would be very slow
        // to probe all the sub-modules looking for some
        // component.  We use a sneaky tactic to avoid
        // that drudgery: we attempt to create a component
        // rather than trying to list an existing one, and
        // then look for the "already exists" error
        //
        // If special property "scratch" exists in the root
        // of the document this function becomes a no-op
        //
        name: 'f5bigComponent',
        definition: (that) => ({
            type: 'object',
            errors: true,
            modifying: true,
            metaSchema: {
                type: 'string',
                pattern: '^(asm policy|((query|probe) ([^\\x20]+\\x20)*[^\\x20]+))?$'
            },
            validate(schema, data, parentSchema, dataPath, parentData, pptyName, rootData) {
                if (typeof rootData.scratch !== 'undefined'
                    || util.getDeepValue(that.context, 'target.deviceType') === DEVICE_TYPES.BIG_IQ) {
                    // don't want to check components right now
                    // e.g. running on BIG-IQ or expanding defaults in old decl on BIG-IP
                    return true;
                }

                // here 'mySchema' is like "query ltm pool" or
                // "probe ltm monitor icmp" or "asm policy"
                // and 'data' is component name like
                // "/Common/fubar" or "http-tunnel" or even
                // route-domain number.  Most component names
                // should be absolute and that is enforced in
                // the schema using format=f5bigip, but some
                // components like tunnels lack pathnames

                if ((schema === '') || ((typeof data === 'object') && ((data === null)
                        || !Object.prototype.hasOwnProperty.call(data, 'bigip')))) {
                    return true; // well this is easy
                }

                // component name
                const testName = ((typeof data === 'object') ? data.bigip.replace(/["]+/g, '') : data).toString();

                /** ***
                log.debug("will check if " + test_name + " exists in " +
                            mySchema + " for " + data_path);
                **** */

                const elems = schema.split('\x20');

                const tactic = elems.shift();

                const method = (tactic === 'probe') ? 'POST' : 'GET';

                const isAsm = (elems[0] === 'asm');

                let testUrl = '/mgmt/tm/';

                // Reminder to change logic if ASM support is expanded
                if (isAsm && elems[1] !== 'policy') {
                    throw new Error(`asm ${elems[1]} is not currently supported`);
                }

                if (isAsm) {
                    testUrl = testUrl.concat('asm/policies');
                } else {
                    testUrl = testUrl.concat(elems.join('/'));
                }

                let payload;

                if (method === 'GET') {
                    if (!isAsm) {
                        testUrl = `${testUrl}/${testName.replace(/\x2f/g, '~')}`;
                    }
                } else {
                    payload = JSON.stringify({ name: testName });
                }

                if (typeof data.bigip === 'string' && data.bigip.includes(' ')
                    && !data.bigip.includes('"')) {
                    data.bigip = `"${data.bigip}"`;
                }

                const component = that.components.find((comp) => comp.testOptions.path === testUrl);
                if (!component) {
                    that.components.push({
                        data,
                        dataPaths: [dataPath],
                        isAsm,
                        testName,
                        testOptions: {
                            path: testUrl,
                            method,
                            send: payload,
                            crude: true
                        }
                    });
                } else {
                    component.dataPaths.push(dataPath);
                }

                return true;
            }
        })
    },
    {
        // custom keyword 'f5expand' replaces backquote
        // escapes in strings in declarations
        //
        // If special property "scratch" exists in the root
        // of the document this function becomes a no-op.
        //
        name: 'f5expand',
        definition: (that) => ({
            // type: "string", -- we will manage within
            errors: true,
            modifying: true,
            metaSchema: {
                type: ['boolean', 'object'],
                properties: {
                    when: {
                        type: 'string',
                        minLength: 1
                    },
                    to: {
                        type: 'string',
                        minLength: 1
                    }
                }
            },
            compile(schema) {
                const mySchema = schema;

                return function f5expand(data, dataPath, parentData, pptyName, rootData) {
                    if (typeof rootData.scratch !== 'undefined') {
                        // don't want to expand escapes right now
                        // (probably just expanding defaults in old decl)
                        return true;
                    }

                    if (typeof data !== 'string') {
                        // shucks, we can only expand a string!  (We
                        // check here instead of using 'type' option
                        // with addKeyword because ajv looks at
                        // object-type only once, so if f5PostProcess(fetch) gets
                        // us a string from an F5string url or wherever,
                        // thus replacing 'data' object with string,
                        // ajv won't know about that, so it wouldn't
                        // call us if options contained type:"string"
                        return true;
                    }

                    // The BIG-IQ should skip this keyword as it should NOT modify the declaration
                    if (util.getDeepValue(that.context, 'target.deviceType') === DEVICE_TYPES.BIG_IQ) {
                        return true;
                    }

                    f5expand.errors = [];
                    const myerror = {
                        keyword: 'f5expand',
                        params: {}
                    };

                    // schema property "when" (if any) is AS3 pointer to
                    // boolean value in declaration that says whether
                    // or not target should be expanded
                    const rv = { now: mySchema.toString() };
                    if (Object.prototype.hasOwnProperty.call(mySchema, 'when') && (mySchema.when !== '')) {
                        try {
                            extractUtil.getAs3Object(
                                mySchema.when,
                                dataPath,
                                parentData,
                                rootData,
                                false,
                                parentData,
                                pptyName,
                                'string',
                                rv,
                                'now'
                            );
                        } catch (e) {
                            myerror.message = `${mySchema.when} ${e.message}`;
                            f5expand.errors.push(myerror);
                            return false;
                        }
                    }

                    // rv.now is string, not boolean
                    if (rv.now !== 'true') {
                        return true; // success (no expansion wanted)
                    }

                    // mySchema property "to" (if any) names another
                    // property of 'parent_data' we should put expansion
                    // into, rather than default 'ppty_name'
                    if (Object.prototype.hasOwnProperty.call(mySchema, 'to') && (mySchema.to !== '')) {
                        pptyName = mySchema.to;
                    }

                    try {
                        expandUtil.backquoteExpand(data, dataPath, parentData, rootData, parentData, pptyName);
                    } catch (e) {
                        myerror.message = e.message;
                        f5expand.errors.push(myerror);
                        return false;
                    }

                    return true;
                };
            }
        })
    },
    /*
     * Prioritizes aliased keyword if exists, otherwise maps the original property value to
     * the missing alias key. The original property is deleted in either case.
     * Should be specified in the parent object, not the target properties themselves.
     *
     * Example: f5aliases: {
     *                         aliasPropertyNameOne: 'originalPropertyNameOne',
     *                         aliasPropertyNameTwo: 'originalPropertyNameTwo'
     *                     }
     *
     * Note: The alias property should not have a default value, even if the original
     * property does. This is because of the 'useDefaults' AJV option and how it
     * auto-fills the defaults for each undefined property. We are not able to determine
     * if a user specified the orignal property or the alias property in this case and
     * the user defined property can end up being overwritten. See 'synCookieAllowlist'
     * in TCP_Profile as an example of a correctly defined alias with the default removed.
     */
    {
        name: 'f5aliases',
        definition: () => ({
            modifying: true,
            compile(aliasObj) {
                return function f5aliases(data) {
                    Object.keys(aliasObj).forEach((alias) => {
                        if (typeof data[aliasObj[alias]] === 'undefined') {
                            return;
                        }
                        if (typeof data[alias] === 'undefined') {
                            data[alias] = data[aliasObj[alias]];
                        }
                        delete data[aliasObj[alias]];
                    });
                    return true;
                };
            }
        })
    },
    {
        name: 'f5serviceDiscovery',
        definition: (that) => ({
            errors: true,
            metaSchema: {
                type: ['boolean', 'object'],
                properties: {
                    exceptions: {
                        type: 'array'
                    }
                }
            },
            compile(schema) {
                return function f5serviceDiscovery(data, dataPath) {
                    if (schema.exceptions && schema.exceptions.find((exception) => exception === data)) {
                        return true;
                    }

                    if (that.settings && that.settings.serviceDiscoveryEnabled === false) {
                        const error = new Error(`${dataPath} requires Service Discovery to be enabled`);
                        error.status = 422;
                        throw error;
                    }

                    /*
                     * Error if SD is not installed and target host is the local machine. This
                     * protects against the case when a user enables SD in the settings, but has
                     * not restarted restnoded to install it yet. AS3 will automatically install
                     * SD on remote machines.
                     */
                    if (that.context.host.sdInstalled === false
                        && that.context.tasks[that.context.currentIndex].resolvedHostIp === '127.0.0.1') {
                        const error = new Error(`${dataPath} requires Service Discovery to be installed. Service Discovery will be installed the next time AS3 starts up`);
                        error.status = 422;
                        throw error;
                    }

                    return true;
                };
            }
        })
    }
];

module.exports = {
    keywords
};
