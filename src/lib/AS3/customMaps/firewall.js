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

const uuid = require('uuid').v4;
const handleObjectRef = require('../../../util/convert/handleObjectRef');
const hyphensToCamel = require('../../../util/convert/hyphensToCamel');
const unquote = require('../../../util/convert/unquote');

module.exports = {

    // Firewall_Address_List
    'security firewall address-list': {
        class: 'Firewall_Address_List',

        keyValueRemaps: {
            addressLists: (key, val) => ({ addressLists: Object.keys(val).map((x) => handleObjectRef(x)) }),

            addresses: (key, val) => ({ addresses: Object.keys(val) }),

            fqdns: (key, val) => ({ fqdns: Object.keys(val) }),

            geo: (key, val) => ({ geo: Object.keys(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // Firewall_Policy
    'security firewall policy': {
        class: 'Firewall_Policy',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            if (rootObj.rules) {
                const rules = Object.keys(rootObj.rules).map((rule) => {
                    let ruleObj = rootObj.rules[rule];
                    if (ruleObj['rule-list']) {
                        ruleObj = handleObjectRef(ruleObj['rule-list']);
                    } else {
                        ruleObj.name = rule;
                        if (ruleObj['ip-protocol']) {
                            ruleObj.protocol = ruleObj['ip-protocol'];
                            delete ruleObj['ip-protocol'];
                        } else {
                            ruleObj.protocol = 'any';
                        }
                        if (ruleObj.irule) {
                            ruleObj.iRule = handleObjectRef(ruleObj.irule);
                            delete ruleObj.irule;
                        }
                        if (ruleObj['irule-sample-rate']) {
                            ruleObj.iRuleSampleRate = parseInt(ruleObj['irule-sample-rate'], 10);
                            delete ruleObj['irule-sample-rate'];
                        }
                        ['source', 'destination'].forEach((prop) => {
                            ['address-lists', 'port-lists'].forEach((list) => {
                                if (ruleObj[prop]) {
                                    if (ruleObj[prop][list]) {
                                        ruleObj[prop][hyphensToCamel(list)] = Object.keys(ruleObj[prop][list])
                                            .map((x) => handleObjectRef(x));
                                        delete ruleObj[prop][list];
                                    }
                                }
                            });
                        });
                    }
                    return ruleObj;
                });

                rootObj.rules = rules;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Firewall_Port_List
    'security firewall port-list': {
        class: 'Firewall_Port_List',

        keyValueRemaps: {
            portLists: (key, val) => ({ portLists: Object.keys(val).map((x) => handleObjectRef(x)) }),

            ports: (key, val) => ({
                ports: Object.keys(val).map(
                    (x) => (parseInt(x, 10) && !x.includes('-') ? parseInt(x, 10) : unquote(x))
                )
            }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // Firewall_Rule_List
    'security firewall rule-list': {
        class: 'Firewall_Rule_List',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const rules = [];

            if (rootObj.rules) {
                Object.keys(rootObj.rules).forEach((rule) => {
                    const ruleObj = rootObj.rules[rule];
                    ['destination', 'source'].forEach((property) => {
                        if (ruleObj[property]) {
                            const addresses = ruleObj[property]['address-lists'];
                            if (addresses) {
                                ruleObj[property].addressLists = Object.keys(addresses).map((x) => handleObjectRef(x));
                                delete ruleObj[property]['address-lists'];
                            }
                            if (ruleObj[property].addresses) {
                                const id = `autogen_${uuid()}`.replace(/-/g, '_');
                                const idRef = handleObjectRef(id);
                                newObj[id] = {
                                    class: 'Firewall_Address_List',
                                    addresses: Object.keys(ruleObj[property].addresses)
                                };
                                if (ruleObj[property].addressLists) {
                                    ruleObj[property].addressLists.push(idRef);
                                } else {
                                    ruleObj[property].addressLists = [idRef];
                                }
                                delete ruleObj[property].addresses;
                            }

                            const ports = ruleObj[property]['port-lists'];
                            if (ports) {
                                ruleObj[property].portLists = Object.keys(ports).map((x) => handleObjectRef(x));
                                delete ruleObj[property]['port-lists'];
                            }
                            if (ruleObj[property].ports) {
                                const id = `autogen_${uuid()}`.replace(/-/g, '_');
                                const idRef = handleObjectRef(id);
                                newObj[id] = {
                                    class: 'Firewall_Port_List',
                                    ports: Object.keys(ruleObj[property].ports).map((x) => (!x.includes('-') ? parseInt(x, 10) : x))
                                };
                                if (ruleObj[property].portLists) {
                                    ruleObj[property].portLists.push(idRef);
                                } else {
                                    ruleObj[property].portLists = [idRef];
                                }
                                delete ruleObj[property].ports;
                            }

                            // Add vlans in firewall if they were used
                            const vlans = ruleObj[property].vlans;
                            if (vlans) {
                                const bigip = (str) => ({ bigip: str });
                                ruleObj[property].vlans = Object.keys(vlans).map((x) => bigip(x));
                            }
                        }
                    });
                    if (ruleObj.description) {
                        ruleObj.remark = unquote(ruleObj.description);
                        delete ruleObj.description;
                    }
                    const protocol = ruleObj['ip-protocol'];
                    if (protocol) {
                        if (protocol === 'any' || protocol === 'tcp' || protocol === 'udp') {
                            ruleObj.protocol = protocol;
                        }
                        delete ruleObj['ip-protocol'];
                    }
                    if (ruleObj.log) {
                        ruleObj.log = ruleObj.log === 'yes';
                        delete ruleObj.log;
                    }
                    if (ruleObj.irule) {
                        ruleObj.iRule = handleObjectRef(ruleObj.irule);
                        delete ruleObj.irule;
                    }
                    if (ruleObj['irule-sample-rate']) {
                        ruleObj.iRuleSampleRate = parseInt(ruleObj['irule-sample-rate'], 10);
                        delete ruleObj['irule-sample-rate'];
                    }
                    ruleObj.name = rule;
                    rules.push(ruleObj);
                });

                rootObj.rules = rules;
            }
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
