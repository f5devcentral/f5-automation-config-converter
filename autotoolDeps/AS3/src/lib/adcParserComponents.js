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

const promiseUtil = require('@f5devcentral/atg-shared-utilities').promiseUtils;

const util = require('./util/util');

function saveMetadata(context, comp, data) {
    // if component is virtual-address, save netmask metadata
    if (comp.testOptions.path.startsWith('/mgmt/tm/ltm/virtual-address')) {
        comp.dataPaths.forEach((path) => {
            util.setDeepValue(
                context.tasks[context.currentIndex],
                `metadata${path.replace(/\//g, '.')}`,
                {
                    address: data.address,
                    mask: data.mask
                }
            );
        });
    }
}

function getAsmPolicies(context, testOptions) {
    return util.iControlRequest(context, testOptions)
        .then((rslt) => {
            // we expect a JSON payload in rslt.body
            let info;
            try {
                info = JSON.parse(rslt.body);
            } catch (e) {
                e.message = `cannot parse JSON reply to GET /asm/policies (${e.message})`;
                throw e;
            }
            if ((typeof info.items === 'object')
                && Array.isArray(info.items)) {
                return info.items;
            }
            return [];
        });
}

function checkComponent(context, comp) {
    const testOptions = comp.testOptions;
    const data = comp.data;
    const testName = comp.testName;
    const method = testOptions.method;
    let testUrl = testOptions.path;

    return util.iControlRequest(context, testOptions)
        .then((rslt) => {
            // we expect a JSON payload in rslt.body
            let info;
            try {
                info = JSON.parse(rslt.body);
            } catch (e) {
                e.message = `cannot parse JSON reply to ${method} `
                    + `${util.redactURL(testUrl)} (${e.message})`;
                throw e;
            }

            if ((method === 'POST') && Object.prototype.hasOwnProperty.call(info, 'code')) {
                if (info.code !== 409) {
                    throw new Error(`got unrecognized code ${info.code} from ${method} `
                        + `${util.redactURL(testUrl)}`);
                }

                // right! attempt to create failed,
                // which means component exists,
                // which makes us happy
                return true;
            }

            if (method === 'POST') {
                // oops! attempt to create succeeded,
                // which means component did not exist
                // previously, which means customer
                // error, which makes us sad...
                // and we must delete our component
                testUrl = `${testUrl}/${testName.replace(/\x2f/g, '~')}`;
                testOptions.path = testUrl;
                testOptions.method = 'DELETE';
                delete testOptions.send;

                return util.iControlRequest(context, testOptions)
                    .catch((e) => {
                        e.message = (`requested component ${data.bigip} does not exist; `
                            + 'also failed to remove '
                            + `test component ${util.redactURL(testUrl)} (${e.message})`);
                        throw e;
                    })
                    .then(() => {
                        throw new Error(`requested component ${data.bigip} does not exist`);
                    });
            }

            if (Object.prototype.hasOwnProperty.call(info, 'code')) {
                // requested component not found
                if (info.code === 404) {
                    throw new Error(`requested component ${data.bigip} does not exist`);
                } else {
                    throw new Error(`got unrecognized code ${info.code} from ${method}`
                        + `${util.redactURL(testUrl)}`);
                }
            }

            // otherwise, component was found,
            // which is exactly what customer wants

            // Check and store component as metadata for later
            if (method === 'GET') {
                saveMetadata(context, comp, info);
            }

            return true;
        });
}

function handleComponents(context, components) {
    let asmPolicies = components.filter((c) => c.isAsm);
    let promise;
    if (!util.isEmptyOrUndefined(asmPolicies)) {
        promise = getAsmPolicies(context, asmPolicies[0].testOptions);
    } else {
        promise = Promise.resolve();
    }

    return promise.then((res) => {
        asmPolicies = res;
        const perPath = components.reduce((acc, cur) => {
            const prop = {};
            prop[cur.dataPaths[0]] = acc[cur.dataPaths[0]] || [];
            prop[cur.dataPaths[0]].push(cur);
            return Object.assign(acc, prop);
        }, {});

        const promises = Object.keys(perPath).map((path) => {
            const comps = perPath[path];
            return promiseUtil.raceSuccess(comps.map((c) => {
                if (c.isAsm) {
                    const foundPol = asmPolicies.filter((p) => p.fullPath === c.testName);
                    if (util.isEmptyOrUndefined(foundPol)) {
                        return Promise.reject(new Error(`Unable to find specified WAF policy ${c.testName} for ${path}`));
                    }
                    return Promise.resolve(true);
                }
                return checkComponent(context, c).catch(() => {
                    throw new Error(`Unable to find ${comps[0].testName} for ${path}`);
                });
            }))
                .catch((errors) => {
                    const error = errors[0];
                    error.status = 422;
                    throw error;
                });
        });

        return Promise.all(promises);
    });
}

module.exports = {
    handleComponents
};
