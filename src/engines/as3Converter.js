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

/* eslint-disable no-continue */

const deepmerge = require('deepmerge');
const path = require('path');

const f5AppSvcsSchema = require('@automation-toolchain/f5-appsvcs-schema');
const customDict = require('../lib/AS3/customDict');
const customHandling = require('../lib/AS3/customHandling');
const declarationBase = require('../util/convert/declarationBase');
const dedupeArray = require('../util/convert/dedupeArray');
const deleteProperty = require('../util/convert/deleteProperty');
const findLocation = require('../util/convert/findLocation');
const getKey = require('../util/getKey');
const getMergedAS3Properties = require('../util/getMergedAS3Properties');
const hyphensToCamel = require('../util/convert/hyphensToCamel');
const isInteger = require('../util/convert/isInteger');
const isIPv4 = require('../util/convert/isIPv4');
const isIPv6 = require('../util/convert/isIPv6');
const log = require('../util/log');
const prependObjProps = require('../util/convert/prependObjProps');

const defaults = require('../lib/bigipDefaults.json');

const deDupeObjectNames = (json) => {
    const supported = ['ltm pool', 'ltm profile', 'ltm virtual', 'ltm rule', 'ltm policy', 'ltm monitor'];
    const ipNameSupported = ['ltm virtual', 'ltm pool', 'ltm monitor'];
    const dupeArray = [];
    const ipNameArray = [];
    const jsonKeys = Object.keys(json);

    // Check original json for duplicates. Check objects names
    jsonKeys.forEach((jsonKey) => {
        const confKey = getKey(jsonKey);
        const confKeyName = jsonKey.split(' ').pop();

        // Check if current key is supported for dupe.
        if (supported.filter((item) => jsonKey.startsWith(`${item} `) && !confKey.includes('ocsp-stapling-params')).length) {
            // As a result we will have an array. Check length.
            if (jsonKeys.filter((item) => item.split(' ').pop() === confKeyName
            && item !== jsonKey && !item.includes('virtual-address')).length) {
                dupeArray.push(jsonKey);
            }
        }

        // Check if current key is supported for have ip name.
        if (ipNameSupported.filter((item) => jsonKey.startsWith(`${item} `)).length) {
            const objName = path.basename(confKeyName);

            // It should start from number and not be dupe of any object
            if (objName.match(/^\d/) && !dupeArray.includes(jsonKey)) ipNameArray.push(jsonKey);
        }
    });

    // Join objects for update
    const tempArray = dupeArray.concat(ipNameArray);

    // IF no duplicates or ip names found, return json as it is.
    if (!tempArray.length) return json;

    const updatedDict = {};

    tempArray.forEach((objectToUpdate) => {
        jsonKeys.forEach((jsonKey) => {
            if (objectToUpdate === jsonKey) {
                const objType = getKey(objectToUpdate).split(' ')[1];
                const objFullName = objectToUpdate.split(' ').pop();
                const objName = path.basename(objFullName);
                const objPath = path.dirname(objFullName);
                let objNewName = path.join(objPath, `${objType}_${objName}`);

                // Specific name for dupes
                if (dupeArray.includes(objectToUpdate)) objNewName = `${objNewName}_dup`;

                // Prior changing name, we need to find references in original json and update them.
                Object.keys(json).forEach((jKey) => {
                    const jValue = json[jKey];

                    // We've to transform rule and profile to rules and profiles to change in object.
                    let tempobjType;
                    if (objType === 'rule' || objType === 'profile') {
                        tempobjType = `${objType}s`;
                    } else tempobjType = objType;

                    // Rules and profiles cases:
                    // Rules and profiles inside are objects.
                    if (jValue[tempobjType]
                        && Object.prototype.hasOwnProperty.call(jValue[tempobjType], objFullName)) {
                        const innerPropertyValue = jValue[tempobjType][objFullName];
                        jValue[tempobjType][objNewName] = innerPropertyValue;
                        delete jValue[tempobjType][objFullName];
                    } else if ((jValue[tempobjType]
                        && typeof jValue[tempobjType] === 'string')
                        && jValue[tempobjType] === objFullName) {
                        // Virtual servers cases:
                        // pool /Common/<poolname>
                        jValue[tempobjType] = objNewName;
                    }
                });

                // Rename object here.
                updatedDict[`${getKey(objectToUpdate)} ${objNewName}`] = json[jsonKey];
            } else if (jsonKey && !tempArray.includes(jsonKey)) {
                // Not duplicates goes here without changes.
                updatedDict[jsonKey] = json[jsonKey];
            }
        });
    });
    return updatedDict;
};

const defaultsFromInheritance = (json) => {
    const supported = ['ltm monitor', 'ltm profile'];
    const jsonKeys = Object.keys(json);

    jsonKeys.forEach((jsonKey) => {
        const confKey = getKey(jsonKey);

        // supported objects
        if (supported.filter((item) => jsonKey.startsWith(item)).length !== 0) {
            const parent = json[jsonKey]['defaults-from'];

            // if object is default to BIG-IP, do not update
            if (!defaults.includes(parent)) {
                // create heritage list
                // T3 -> defaults-from T2 -> defaults-from T1 -> defaults-from default
                // [T3, T2, T1]
                let parentList = [];
                const objName = jsonKey.split(confKey)[1].trim();
                let tempObjName = objName;

                do {
                    parentList.push(tempObjName);
                    tempObjName = json[confKey.concat(' ', tempObjName)]['defaults-from'];
                } while (confKey.concat(' ', tempObjName) in json);
                parentList = parentList.map((x) => confKey.concat(' ', x));

                // merge object's params
                let updatedObj = {};
                parentList.forEach((item) => {
                    updatedObj = { ...json[item], ...updatedObj };
                });

                json[jsonKey] = updatedObj;
                delete json[jsonKey]['defaults-from'];
            }
        }
    });

    return json;
};

const convertEngine = (confObj, confKey) => {
    let obj = {};
    const def = customDict[confKey];

    // check for as3Properties map override (ie monitors, persistence)
    let lookupKey = confKey;
    if (def && def.lookupOverride) lookupKey = def.lookupOverride;

    // extend as3Properties with custom
    const as3PropertiesExt = getMergedAS3Properties();

    const dict = as3PropertiesExt[lookupKey] || [];
    const idMap = dict.map((x) => x.id);
    Object.keys(confObj).forEach((configProp) => {
        if (idMap.includes(configProp)) {
            let propVal = confObj[configProp];
            const dictEntry = dict[idMap.indexOf(configProp)];

            // handle extend (array, object).
            if (dictEntry.extend === 'object') {
                // recurse to find 'ltm profile http hsts' for ex
                const newConfKey = `${confKey} ${configProp}`;
                let recurse = convertEngine(propVal, newConfKey);

                // determine if remap/prepend props is required
                if (def && def.prependProps && def.prependProps.includes(configProp)) {
                    recurse = prependObjProps(recurse, configProp);
                }

                // attach directly to new object
                obj = Object.assign(obj, recurse);
                return;
            }

            // coerce to array, if not already
            if (dictEntry.extend === 'array' && !Array.isArray(propVal)) {
                // don't convert empty arrays
                if (propVal === 'none') return;
            }

            // handle altId && convert to camelCase
            const key = dictEntry.altId || hyphensToCamel(dictEntry.id);

            // handle truth && falsehood
            if (dictEntry.truth && dictEntry.falsehood) {
                if (propVal === dictEntry.truth) propVal = true;
                if (propVal === dictEntry.falsehood) propVal = false;
            }

            // parse integer array
            if (Array.isArray(propVal)) {
                propVal = propVal.map((val) => (isInteger(val) ? parseInt(val, 10) : val));

            // do not parse ip addresses
            } else if (isIPv4(propVal) || isIPv6(propVal)) {

                // do nothing
            } else if (typeof propVal === 'string' && propVal.includes(':')) {

                // do nothing
            } else {
                // do not parse props that could be string OR int (note: BIG-IP config)
                // Monitor send/receive
                const strInt = ['send', 'recv', 'recv-disable'];
                if (!strInt.includes(configProp)) {
                    propVal = isInteger(propVal) ? parseInt(propVal, 10) : propVal;
                }
            }

            // Apply any custom rules and map over props
            obj = Object.assign(obj, customHandling(key, propVal, confKey));
        }
    });
    return obj;
};

/**
 * Func descriptions goes here
 *
 * @param {Object} declarationNext - AS3 declaration ready to clean up for get Next
 * @param {Object} config - config
 * @param {boolean} config.next - flag enables AS3 to AS3 Next conversion
 *
 * @returns {Object} declarationNext - when clean up completed
 */
const as3NextCleanUp = (declarationNext, config) => {
    let keyNextNotSupported = [];
    if (config && config.next) {
        log.info('AS3 Next conversion enabled');

        const cleanUpList = f5AppSvcsSchema.validate(declarationNext, { mode: 'lazy', runtime: 'next' }).ignoredAttributes;

        keyNextNotSupported = cleanUpList
            .filter((item) => item.split('/').length === 4)
            .map((item) => item.replace('/Common/Shared/', '/Common/'));

        cleanUpList.forEach((pathToProp) => {
            // temporary workaround for AS3 Next bug
            log.debug(`Delete property from object: ${pathToProp}`);
            if (pathToProp !== '/schemaVersion') {
                if (!pathToProp.startsWith('/')) {
                    log.error(`Wrong path received from ignoredAttributes: ${pathToProp}`);
                }
                deleteProperty(declarationNext, pathToProp);
            }
        });

        // validator and AS3 Next use the same shared schema
        const schema = f5AppSvcsSchema.getSchemaByRuntime('next');
        declarationNext.schemaVersion = schema.definitions.ADC.properties.schemaVersion.enum[0];

        const ignoredAttributes = f5AppSvcsSchema.validate(declarationNext, { mode: 'lazy', runtime: 'next' }).ignoredAttributes;
        if (ignoredAttributes.length > 0) {
            log.warn('Received AS3 Next Declaration is not fully cleaned.');
        }
    }

    return {
        declarationNext,
        keyNextNotSupported
    };
};

module.exports = (json, config) => {
    try {
        // start with basic json structure
        const declObj = declarationBase.AS3(config);
        const unconvertedArr = [];

        // use for cleanup redirect services
        const redirectVS = [];

        // cleanup Duplicates
        const jsonDeduped = deDupeObjectNames(json);

        // defaults-from inheritance
        const jsonDefaultsUpdated = defaultsFromInheritance(jsonDeduped);
        const fileKeys = Object.keys(jsonDeduped);

        // filter http iapp keys
        const regexHttpiApp = /ltm\svirtual\s(\/\w+\/\w+\.app)/;
        const httpiApps = fileKeys.filter((item) => item.match(regexHttpiApp));
        const iappPath = httpiApps.map((item) => item.match(regexHttpiApp)[1]);
        const iappSupported = fileKeys.filter((item) => iappPath.some((el) => item.includes(el)));

        // iterate through config objects
        fileKeys.forEach((fileKey) => {
            const confKey = getKey(fileKey);
            const confObj = jsonDefaultsUpdated[fileKey];
            try {
                // Determine corresponding AS3 class
                if (customDict[confKey] && !customDict[confKey].noDirectMap) {
                    // Convert config into AS3-json

                    // analytics profile capture filter can have any name, rename to a constant value, should only be 1
                    if (confKey === 'ltm profile analytics') {
                        const tcString = 'traffic-capture';
                        const tcObj = confObj[tcString];
                        if (tcObj && typeof tcObj === 'object' && Object.keys(tcObj).length === 1) {
                            const keyZeroName = Object.getOwnPropertyNames(confObj[tcString])[0];
                            const keyZeroValue = tcObj[Object.keys(tcObj)[0]];
                            confObj[tcString]['capture-for-f5-appsvcs'] = keyZeroValue;
                            delete confObj[tcString][keyZeroName];
                        }
                    }

                    const obj = convertEngine(confObj, confKey);

                    let filePath = fileKey.split(confKey)
                        .map((x) => x.trim())
                        .filter((x) => x)[0];

                    // fix for un-prefixed profiles on /Common 16.1
                    if (!filePath.startsWith('/')) {
                        fileKey = fileKey.replace(filePath, `/Common/${filePath}`);
                        filePath = `/Common/${filePath}`;
                    }

                    // if object is default to BIG-IP, do not convert
                    if (defaults.includes(filePath)) return;

                    obj.class = customDict[confKey].class;

                    const loc = findLocation(fileKey);
                    log.debug(`Converting ${filePath} "${customDict[confKey].class}"`);

                    // partial support for iApps
                    if (loc.iapp && !fileKey.startsWith('sys application service')
                        && !iappSupported.includes(fileKey)) return;

                    // Non default objects in /Common/ should be in /Common/Shared
                    // ex: /Common/somewhere/test -> /Common/Shared/test
                    //     /Common/test2 -> /Common/Shared/test2
                    if (loc.tenant === 'Common' && loc.app !== 'Shared' && loc.profile) loc.app = 'Shared';

                    // relocate /Common to /Common/Shared or
                    // in case of virtual-address /AS3_Tenant/1.2.3.4 to /AS3_Tenant/Shared/1.2.3.4
                    if (!loc.profile) {
                        loc.profile = loc.app;
                        loc.app = 'Shared';
                    }

                    // create tenants
                    if (!declObj[loc.tenant]) declObj[loc.tenant] = { class: 'Tenant' };

                    // Connect multiple objects together
                    // special edge case for Service_Address (locate to <tenant>/Shared)
                    if (confKey === 'ltm virtual-address') {
                        // if loc.app is IPv4, then it belongs indirectly to a Service
                        if (isIPv4(loc.profile.replace(/_/g, '.'))) return;

                        // else its a Service_Address
                        if (!declObj[loc.tenant].Shared) {
                            declObj[loc.tenant].Shared = { class: 'Application', template: 'shared' };
                        }

                        const custom = customDict[confKey].customHandling(obj, loc, jsonDefaultsUpdated);
                        declObj[loc.tenant].Shared = Object.assign(declObj[loc.tenant].Shared, custom);
                        return;
                    }

                    // if there's a custom override:
                    let customObj = {};
                    if (customDict[confKey].customHandling) {
                        customObj = customDict[confKey].customHandling(obj, loc, jsonDefaultsUpdated);
                    }

                    // Service_HTTPS specific override. Collect all http virtuals and check Redirect cases
                    if (confKey === 'ltm virtual'
                        && customObj[loc.profile].iRules
                        && customObj[loc.profile].iRules[0].bigip === '/Common/_sys_https_redirect') {
                        redirectVS.push({ add: customObj[loc.profile].virtualAddresses, loc });
                    }

                    // Multiple virtualPort specific override
                    if (confKey === 'ltm virtual' && customObj[loc.profile].virtualPort && customObj[loc.profile].virtualPort.length > 1) {
                        const tempObj = customObj[loc.profile];
                        customObj[loc.profile].virtualPort.forEach((port) => {
                            tempObj.virtualPort = port;
                            customObj[`${loc.profile}_${port}`] = JSON.parse(JSON.stringify(tempObj));
                        });
                        delete customObj[loc.profile];
                    }

                    // 'duplicate' profile
                    // in some cases duplicates named object-1-, in some object-1
                    const profileSlice = loc.profile.match(/[_.-]\d+-{0,1}$/ig);

                    if (profileSlice) {
                        const reReplace = new RegExp(profileSlice[0], 'g');
                        const origProfile = loc.profile.replace(reReplace, '');
                        const dupeInt = parseInt(profileSlice[0].slice(1), 10);
                        const declReady = declObj[loc.tenant][loc.app] && declObj[loc.tenant][loc.app][origProfile];
                        if (loc.profile && !Number.isNaN(dupeInt) && declReady && declReady.class !== 'Monitor') {
                            const origObj = declObj[loc.tenant][loc.app][origProfile];

                            // Don't merge if have different ports
                            if (origObj.virtualPort === obj.virtualPort) {
                                // merge 'duplicate' items together
                                // assumes any diffs will be within arrays
                                // remove any dupes from arrays in merged object
                                const merged = deepmerge(origObj, obj);
                                Object.keys(merged).forEach((mergeKey) => {
                                    if (Array.isArray(merged[mergeKey])) {
                                        merged[mergeKey] = dedupeArray(merged[mergeKey]);
                                    }
                                });
                                declObj[loc.tenant][loc.app][origProfile] = merged;

                                // Check customObj has more object than just 1 profile
                                // Certs can be additional, reassign them
                                if (Object.keys(customObj).length > 1) {
                                    const customKeys = Object.keys(customObj);
                                    customKeys.forEach((customKey) => {
                                        if (!customKey.startsWith(origProfile)) {
                                            declObj[loc.tenant][loc.app][customKey] = customObj[customKey];
                                            delete customObj[customKey];
                                        }
                                    });
                                }

                                return;
                            }
                        }
                    }

                    // only /Common/Shared is valid for /Common tenant
                    if (loc.tenant === 'Common' && loc.app === 'ServiceDiscovery') return;

                    // typical handling
                    declObj[loc.tenant][loc.app] = { class: 'Application', template: 'generic', ...declObj[loc.tenant][loc.app] };

                    // if custom handling, do not auto-attach
                    if (!customDict[confKey].customHandling) {
                        declObj[loc.tenant][loc.app][loc.profile || loc.app] = obj;
                    }

                    // duplicate as3-object detection (naming collision)
                    Object.keys(customObj).forEach((custKey) => {
                        if (declObj[loc.tenant][loc.app][custKey] && custKey !== 'template' && custKey !== 'certificate_default') {
                            log.warn(`Duplicate object name detected: ${custKey} exists as both ${declObj[loc.tenant][loc.app][custKey].class} and ${customObj[custKey].class}`);
                        }
                    });

                    // attach custom object to declaration
                    declObj[loc.tenant][loc.app] = Object.assign(declObj[loc.tenant][loc.app], customObj);

                    // make sure that 'Shared' app is always has a template 'shared'
                    if (loc.app === 'Shared') declObj[loc.tenant][loc.app].template = 'shared';
                } else if (!customDict[confKey]) {
                    // Log object as 'unsupported' by ACC
                    unconvertedArr.push(fileKey);
                }
            } catch (e) {
                log.error(`Error converting: ${fileKey}`);
            }
        });

        // remove Common if no stanzas
        if (declObj.Common && Object.keys(declObj.Common).length === 1) {
            delete declObj.Common;
        }

        // cleanup 'redirect' virtual servers
        redirectVS.forEach((red) => {
            // look at all objects and check virtual servers only
            fileKeys.forEach((fileKey) => {
                const confKey = getKey(fileKey);
                if (confKey === 'ltm virtual') {
                    const loc = findLocation(fileKey);
                    const partObj = declObj[loc.tenant][loc.app];
                    const objVS = (loc.profile && partObj) ? partObj[loc.profile] : partObj;

                    // skip empty objects
                    if (objVS !== undefined) {
                        // check that virtual server has the same address and has https type
                        const destAddr = Array.isArray(objVS.virtualAddresses[0])
                            ? objVS.virtualAddresses[0][0]
                            : objVS.virtualAddresses[0];

                        if (destAddr.includes(red.add[0]) && objVS.class === 'Service_HTTPS') {
                            declObj[loc.tenant][loc.app][loc.profile].redirect80 = true;
                        }

                        // remove explicit redirect Service_HTTP in favor of Service_HTTPS.redirect80
                        if (destAddr.includes(red.add[0]) && objVS.class === 'Service_HTTP') {
                            delete declObj[loc.tenant][loc.app][loc.profile];
                        }
                    }
                }
            });
        });

        const as3NotConverted = Object.assign({}, ...unconvertedArr.map((x) => ({ [x]: json[x] })));

        // AS3 Next conversion
        const { declarationNext, keyNextNotSupported } = as3NextCleanUp(declObj, config);

        // count occurrences of unsupported tmsh keys
        const unsupportedStats = {};
        unconvertedArr.map((x) => getKey(x)).forEach((type) => {
            if (!unsupportedStats[type]) unsupportedStats[type] = 0;
            unsupportedStats[type] += 1;
        });

        return {
            declaration: declarationNext,
            iappSupported,
            as3NotConverted,
            keyNextNotSupported,
            unsupportedStats
        };
    } catch (e) {
        e.message = `Error converting input file. Please open an issue at https://github.com/f5devcentral/f5-automation-config-converter/issues and include the following error:\n${e.message}`;
        throw e;
    }
};
