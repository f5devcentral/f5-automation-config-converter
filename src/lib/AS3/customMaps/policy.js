/**
 * Copyright 2021 F5 Networks, Inc.
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

const handleObjectRef = require('../../../util/convert/handleObjectRef');
const hyphensToCamel = require('../../../util/convert/hyphensToCamel');
const unquote = require('../../../util/convert/unquote');

const toCamelCase = (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

module.exports = {

    // Endpoint_Policy
    'ltm policy': {
        class: 'Endpoint_Policy',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) }),

            strategy: (key, val) => ({ strategy: val.replace('/Common/', '') })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // rules
            if (rootObj.rules) {
                rootObj.rules = Object.keys(rootObj.rules).map((x) => {
                    const newRule = { name: unquote(x) };
                    const origRule = rootObj.rules[x];

                    // description -> remark
                    if (origRule.description) newRule.remark = unquote(origRule.description);

                    // rule conditions
                    if (origRule.conditions) {
                        newRule.conditions = Object.keys(origRule.conditions).map((y) => {
                            const oldCondition = origRule.conditions[y];
                            const oldKeys = Object.keys(oldCondition);
                            const newCondition = {};

                            // event
                            if (oldKeys.includes('ssl-server-hello')) newCondition.event = 'ssl-server-hello';
                            else if (oldKeys.includes('ssl-client-hello')) newCondition.event = 'ssl-client-hello';
                            else newCondition.event = 'request';

                            // index
                            if (oldCondition.index) newCondition.index = parseInt(oldCondition.index, 10);

                            // type
                            const types = ['http-uri', 'http-cookie', 'http-header', 'ssl-extension'];
                            for (let i = 0; i < types.length; i += 1) {
                                const type = types[i];
                                if (oldKeys.includes(type)) newCondition.type = toCamelCase(type);
                            }

                            // normalized
                            if (oldKeys.includes('normalized')) newCondition.normalized = true;

                            // name
                            if (oldCondition.name) newCondition.name = oldCondition.name;

                            const operands = ['ends-with', 'starts-with', 'contains', 'equals'];

                            let operand = operands.filter((z) => oldKeys.includes(z))[0] || 'equals';

                            if (oldKeys.includes('not')) {
                                // remove s to convert 'ends-with' to does-not-end-with
                                // and 'contains' to does-not-contain
                                operand = operand.replace(/s-/, '-').replace(/s$/, '');
                                operand = `does-not-${operand}`;
                            }

                            const titles = ['scheme', 'host', 'port', 'path', 'extension', 'query-string', 'server-name',
                                'query-parameter', 'unnamed-query-parameter', 'path-segment', 'npn', 'alpn'];

                            let titleFound = 0;
                            for (let i = 0; i < titles.length; i += 1) {
                                const title = titles[i];
                                if (oldKeys.includes(title)) {
                                    titleFound = 1;
                                    const camelTitle = toCamelCase(title);
                                    newCondition[camelTitle] = {};
                                    if (oldCondition.values) {
                                        if (Array.isArray(oldCondition.values)) {
                                            newCondition[camelTitle].values = oldCondition.values;
                                        } else {
                                            newCondition[camelTitle].values = Object.keys(oldCondition.values);
                                        }
                                    }
                                    if (camelTitle === 'port') {
                                        newCondition[camelTitle].values = oldCondition.values
                                            .map((z) => parseInt(z, 10));
                                    }
                                    newCondition[camelTitle].operand = operand;
                                }
                            }
                            if (!titleFound) {
                                newCondition.all = {};
                                if (oldCondition.values) newCondition.all.values = oldCondition.values;
                                newCondition.all.operand = operand;
                            }

                            return newCondition;
                        });
                    }

                    // rule actions
                    if (origRule.actions) {
                        newRule.actions = Object.keys(origRule.actions).map((y) => {
                            const oldAction = origRule.actions[y];
                            const oldKeys = Object.keys(oldAction);
                            const newAction = {};

                            newAction.event = 'request';

                            // type
                            const typesMap = {
                                'http-uri': toCamelCase('http-uri'),
                                'http-cookie': toCamelCase('http-cookie'),
                                'http-header': toCamelCase('http-header'),
                                http: 'http',
                                forward: 'forward',
                                'server-ssl': 'clientSsl',
                                redirect: 'httpRedirect',
                                shutdown: 'drop',
                                asm: 'waf'
                            };
                            Object.keys(typesMap).forEach((type) => {
                                if (oldKeys.includes(type)) {
                                    newAction.type = typesMap[type];
                                }
                            });

                            // enabled
                            if (oldKeys.includes('disable')) newAction.enabled = false;
                            if (oldKeys.includes('enable')) newAction.enabled = true;

                            // location
                            if (oldKeys.includes('location')) newAction.location = oldAction.location;

                            // find and build the title action
                            if (oldKeys.includes('select')) {
                                newAction.select = {};
                                newAction.select.pool = handleObjectRef(oldAction.pool);
                            } else {
                                const titles = ['insert', 'replace', 'remove'];
                                for (let i = 0; i < titles.length; i += 1) {
                                    const title = titles[i];
                                    if (oldKeys.includes(title)) {
                                        newAction[title] = {};
                                        if (oldAction.name) newAction[title].name = oldAction.name;
                                        if (oldAction.value) newAction[title].value = oldAction.value;
                                        if (oldAction['query-string']) newAction[title].queryString = oldAction['query-string'];
                                        if (oldAction.path) newAction[title].path = unquote(oldAction.path).replace(/\\/g, '');
                                    }
                                }
                            }
                            return newAction;
                        });
                    }
                    return newRule;
                });
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Endpoint_Strategy
    'ltm policy-strategy': {
        class: 'Endpoint_Strategy',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // operands
            if (rootObj.operands) {
                const operandKeys = Object.keys(rootObj.operands);
                const operands = operandKeys.map((x) => hyphensToCamel(Object.keys(rootObj.operands[x]).join(' ')));
                rootObj.operands = operands;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Idle_Timeout_Policy
    'net timer-policy': {
        class: 'Idle_Timeout_Policy',

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const rules = [];

            const ruleNames = Object.keys(rootObj.rules);
            for (let i = 0; i < ruleNames.length; i += 1) {
                const rule = ruleNames[i];
                const ruleConf = rootObj.rules[rule];

                const obj = { name: rule };

                if (ruleConf.description) {
                    obj.remark = unquote(ruleConf.description);
                }

                obj.protocol = ruleConf['ip-protocol'];
                obj.idleTimeout = +ruleConf.timers['flow-idle-timeout'].value ? +ruleConf.timers['flow-idle-timeout'].value : 'unspecified';

                if (ruleConf['destination-ports']) {
                    const ports = Object.keys(ruleConf['destination-ports']);
                    obj.destinationPorts = ports.map((x) => (+x ? +x : 'all-other'));
                }

                rules.push(obj);
            }

            rootObj.rules = rules;
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
