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

/* eslint-disable no-continue, no-use-before-define */
const declarationBase = require('../util/convert/declarationBase');
const log = require('../util/log');

const searchforObject = (json, obj, tenant, application) => {
    /* Search for linked object by name or path.
    */

    let foundObject = {};
    // object name consists full path
    if (typeof obj === 'string' && obj.includes('/')) {
        const split = obj.split('/');
        if (split[3]) {
            tenant = split[1];
            application = split[2];
            obj = split[3];
        }
    }
    if (json[tenant][application][obj]) {
        foundObject = {
            objName: obj, objTenant: tenant, objApplication: application, obj: json[tenant][application][obj]
        };
    } else if (json.Common && json.Common.Shared[obj]) {
        foundObject = {
            objName: obj, objTenant: 'Common', objApplication: 'Shared', obj: json.Common.Shared[obj]
        };
    }
    return foundObject;
};

const searchForObjectAndDependents = (dependents, json, objName, tenantApp) => {
    /* Find depentend object and continue into it to search for its dependents.
       Return new object path if relocated.
     */

    const depObj = searchforObject(json, objName, tenantApp.tenant, tenantApp.application);
    if (Object.keys(depObj).length) {
        if (depObj.objTenant !== tenantApp.tenant || depObj.objApplication !== tenantApp.application) {
            objName = `/${tenantApp.tenantTarget}/${tenantApp.applicationTarget}/${depObj.objName}`;
        }
        dependents[depObj.objName] = depObj.obj;
        searchForDependents(dependents, json, depObj.obj, tenantApp);
    }
    return objName;
};

const searchForDependents = (dependents, json, confObj, tenantApp) => {
    /* Go recursively through objects and search all linked and populate dependents array.
       Populate dependents array.
    */

    const objKeys = Object.keys(confObj);
    const keysToSkip = ['remark', 'class', 'id', 'iRule'];
    for (let i = 0; i < objKeys.length; i += 1) {
        const confKey = objKeys[i];
        if (keysToSkip.includes(confKey)) continue;
        const obj = confObj[confKey];
        if (typeof obj === 'boolean') continue;
        if (Array.isArray(obj)) { // if param is array
            for (let t = 0; t < obj.length; t += 1) {
                let objElem = obj[t];
                if (typeof objElem === 'object') { // if sub-param is object
                    const objSubKeys = Object.keys(objElem);
                    for (let k = 0; k < objSubKeys.length; k += 1) {
                        objElem[objSubKeys[k]] = searchForObjectAndDependents(
                            dependents,
                            json,
                            objElem[objSubKeys[k]],
                            tenantApp
                        );
                    }
                } else { // if sub-param is value
                    objElem = searchForObjectAndDependents(dependents, json, objElem, tenantApp);
                }
            }
        } else if (typeof obj === 'object') { // if param is object
            const objSubKeys = Object.keys(obj);
            for (let k = 0; k < objSubKeys.length; k += 1) {
                obj[objSubKeys[k]] = searchForObjectAndDependents(
                    dependents,
                    json,
                    obj[objSubKeys[k]],
                    tenantApp
                );
            }
        } else { // if param is value
            confObj[confKey] = searchForObjectAndDependents(dependents, json, obj, tenantApp);
        }
    }
};

module.exports = (json, config) => {
    /* Start from virtual server provided and find all linked oblects. Save under provided tenant and application
    */

    if (!config.vsName) return json;
    const targetJson = JSON.parse(JSON.stringify(json));
    const virtualServer = config.vsName;

    const tenant = virtualServer.split('/')[1];
    let application = virtualServer.split('/')[2];
    let vsName = virtualServer.split('/')[3];

    if (!vsName) {
        vsName = application;
        application = 'Shared';
    }

    // Check if vsName is presented in json
    if (!(targetJson[tenant] && targetJson[tenant][application] && targetJson[tenant][application][vsName])) {
        log.warn(`Target virtual server is not found in json: ${config.vsName}`);
        return json;
    }

    let tenantTarget = tenant;
    if (config.tenantTarget) {
        tenantTarget = config.tenantTarget;
        log.info(`Tenant Target: ${tenantTarget}`);
    }
    let applicationTarget = application;
    if (config.applicationTarget) {
        applicationTarget = config.applicationTarget;
        log.info(`Application Target: ${applicationTarget}`);
    }
    const dependents = {};
    try {
        const vsObj = targetJson[tenant][application][vsName];
        vsObj.remark = vsName;
        dependents.serviceMain = vsObj;
        const tenantApp = {
            tenant,
            application,
            tenantTarget,
            applicationTarget
        };
        searchForDependents(dependents, targetJson, vsObj, tenantApp);
        const declObj = declarationBase.AS3();
        declObj.id = targetJson.id;
        declObj[tenantTarget] = {};
        declObj[tenantTarget].class = 'Tenant';
        declObj[tenantTarget][applicationTarget] = {
            class: 'Application',
            template: vsObj.class.split('_')[1].toLowerCase(),
            ...dependents
        };
        log.info(`Target virtual server is found in json: ${config.vsName}`);
        return declObj;
    } catch (e) {
        e.message = `Error filtering by application. Please open an issue at https://github.com/f5devcentral/f5-automation-config-converter/issues and include the following error:\n${e.message}`;
        throw e;
    }
};
