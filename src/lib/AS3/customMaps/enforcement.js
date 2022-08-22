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

const buildProtectedObj = require('../../../util/convert/buildProtectedObj');
const handleObjectRef = require('../../../util/convert/handleObjectRef');
const returnEmptyObjIfNone = require('../../../util/convert/returnEmptyObjIfNone');
const unquote = require('../../../util/convert/unquote');

module.exports = {

    // Enforcement_Interception_Endpoint
    'pem interception-endpoint': {
        class: 'Enforcement_Interception_Endpoint',

        keyValueRemaps: {
            pool: (key, val) => ({ pool: handleObjectRef(val) })
        }
    },

    // Enforcement_iRule; the same as iRule
    'pem irule': {
        class: 'Enforcement_iRule',

        customHandling: (rootObj, loc, file) => {
            const newObj = {};
            let irule = file[loc.original];
            irule = irule.replace(/\/Common/g, '/Common/Shared');
            rootObj.iRule = { base64: Buffer.from(irule).toString('base64') };
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Enforcement_Diameter_Endpoint_Profile
    'pem profile diameter-endpoint': {
        class: 'Enforcement_Diameter_Endpoint_Profile',

        keyValueRemaps: {
            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // fatalGraceTime
            if (rootObj.time) {
                rootObj.fatalGraceTime = rootObj.time;
                delete rootObj.time;
            }

            // irrelevant prop
            delete rootObj.enabled;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Enforcement_Forwarding_Endpoint
    'pem forwarding-endpoint': {
        class: 'Enforcement_Forwarding_Endpoint',

        keyValueRemaps: {
            pool: (key, val) => ({ pool: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            SNATPool: (key, val) => ({ SNATPool: handleObjectRef(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // persistenceHashSettings
            if (rootObj.length && rootObj.offset && rootObj.tclScript && rootObj.source === 'tcl-snippet') {
                rootObj.persistenceHashSettings = {
                    length: rootObj.length,
                    offset: rootObj.offset,
                    tclScript: unquote(rootObj.tclScript)
                };

                delete rootObj.length;
                delete rootObj.offset;
                delete rootObj.tclScript;
                delete rootObj.source;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Enforcement_Subscriber_Management_Profile
    'pem profile subscriber-mgmt': {
        class: 'Enforcement_Subscriber_Management_Profile',

        keyValueRemaps: {
            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            delete rootObj.enabled;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Enforcement_Format_Script
    'pem reporting format-script': {
        class: 'Enforcement_Format_Script',

        keyValueRemaps: {
            definition: (key, val) => ({ definition: `set ${val.set}` })
        }
    },

    // Enforcement_Service_Chain_Endpoint
    'pem service-chain-endpoint': {
        class: 'Enforcement_Service_Chain_Endpoint'
    },

    // Enforcement_Radius_AAA_Profile
    'pem profile radius-aaa': {
        class: 'Enforcement_Radius_AAA_Profile',

        keyValueRemaps: {
            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) }),

            password: (key, val) => ({ password: buildProtectedObj(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            sharedSecret: (key, val) => ({ sharedSecret: buildProtectedObj(val) })
        }
    },

    // Enforcement_Profile
    'pem profile spm': {
        class: 'Enforcement_Profile',

        keyValueRemaps: {
            connectionOptimizationService: (key, val) => returnEmptyObjIfNone(val, {
                connectionOptimizationService: handleObjectRef(val)
            }),

            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) }),

            policiesGlobalHighPrecedence: (key, val) => ({
                policiesGlobalHighPrecedence: Object.keys(val).map((x) => handleObjectRef(x))
            }),

            policiesGlobalLowPrecedence: (key, val) => ({
                policiesGlobalLowPrecedence: Object.keys(val).map((x) => handleObjectRef(x))
            }),

            policiesUnknownSubscribers: (key, val) => ({
                policiesUnknownSubscribers: Object.keys(val).map((x) => handleObjectRef(x))
            }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // Enforcement_Policy
    'pem policy': {
        class: 'Enforcement_Policy',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const rules = rootObj.rules;
            if (rules) {
                rootObj.rules = Object.keys(rootObj.rules).map((x) => {
                    const origRule = rootObj.rules[x];
                    const ruleObj = { name: x };

                    if (origRule['gate-status']) ruleObj.gateStatusEnabled = origRule['gate-status'] === 'enabled';

                    if (origRule.precedence) ruleObj.precedence = parseInt(origRule.precedence, 10);
                    if (origRule['dscp-marking-downlink']) ruleObj.dscpMarkingDownlink = parseInt(origRule['dscp-marking-downlink'], 10);
                    if (origRule['dscp-marking-uplink']) ruleObj.dscpMarkingUplink = parseInt(origRule['dscp-marking-uplink'], 10);
                    if (origRule['l2-marking-downlink']) ruleObj.l2MarkingDownlink = parseInt(origRule['l2-marking-downlink'], 10);
                    if (origRule['l2-marking-uplink']) ruleObj.l2MarkingUplink = parseInt(origRule['l2-marking-uplink'], 10);
                    if (origRule['tcp-analytics-enable']) ruleObj.tcpAnalyticsEnabled = origRule['tcp-analytics-enable'] === 'enabled';

                    if (origRule['service-chain']) ruleObj.serviceChain = handleObjectRef(origRule['service-chain']);
                    if (origRule.intercept) ruleObj.interceptionEndpoint = handleObjectRef(origRule.intercept);
                    if (origRule['tcp-optimization-downlink']) ruleObj.tcpOptimizationDownlink = handleObjectRef(origRule['tcp-optimization-downlink']);
                    if (origRule['tcp-optimization-uplink']) ruleObj.tcpOptimizationUplink = handleObjectRef(origRule['tcp-optimization-uplink']);

                    const classFilter = origRule['classification-filters'];
                    if (classFilter) {
                        ruleObj.classificationFilters = Object.keys(classFilter).map((y) => ({
                            name: y,
                            application: handleObjectRef(classFilter[y].application),
                            invertMatch: classFilter[y].operation === 'nomatch'
                        }));
                    }

                    if (origRule['flow-info-filters']) {
                        ruleObj.flowInfoFilters = Object.keys(origRule['flow-info-filters']).map((y) => {
                            const flowObj = { name: y };
                            const flow = origRule['flow-info-filters'][y];
                            if (flow.operation === 'nomatch') flowObj.invertMatch = true;
                            if (flow['dscp-code']) flowObj.dscpMarking = parseInt(flow['dscp-code'], 10);
                            if (flow['dst-ip-addr']) flowObj.destinationAddress = flow['dst-ip-addr'].split('/')[0];
                            if (flow['dst-port']) flowObj.destinationPort = parseInt(flow['dst-port'], 10);
                            if (flow['ip-addr-type']) flowObj.ipAddressType = flow['ip-addr-type'].toLowerCase();
                            if (flow.proto) flowObj.protocol = flow.proto;
                            if (flow['src-ip-addr']) flowObj.sourceAddress = flow['src-ip-addr'].split('/')[0];
                            if (flow['src-port']) flowObj.sourcePort = parseInt(flow['src-port'], 10);
                            return flowObj;
                        });
                    }

                    const forwarding = origRule.forwarding;
                    if (forwarding) {
                        const forward = {};
                        if (forwarding['fallback-action']) forward.fallbackAction = forwarding['fallback-action'];
                        if (forwarding.type) forward.type = forwarding.type;
                        ruleObj.forwarding = forward;
                    }

                    const insertCont = origRule['insert-content'];
                    if (insertCont) {
                        const insert = {};
                        if (insertCont.duration) insert.duration = parseInt(insertCont.duration, 10);
                        if (insertCont.frequency) insert.frequency = insertCont.frequency;
                        if (insertCont['tag-name']) insert.tagName = insertCont['tag-name'];
                        if (insertCont.position) insert.position = insertCont.position;
                        if (insertCont['value-content']) insert.valueContent = insertCont['value-content'];
                        if (insertCont['value-type']) insert.valueType = insertCont['value-type'];
                        if (Object.keys(insert).length > 1) ruleObj.insertContent = insert;
                    }

                    // modifyHttpHeader
                    const modify = origRule['modify-http-hdr'];
                    if (modify) {
                        const mod = {};
                        if (modify.name) mod.headerName = modify.name;
                        if (modify.operation) mod.operation = modify.operation;
                        if (modify['value-content']) mod.valueContent = modify['value-content'];
                        if (modify['value-type']) mod.valueType = modify['value-type'];
                        ruleObj.modifyHttpHeader = mod;
                    }

                    // qoeReporting
                    const qoe = origRule['qoe-reporting'];
                    if (qoe) {
                        const hsl = qoe.dest.hsl;
                        const qoeReprt = {};
                        if (hsl['format-script']) qoeReprt.formatScript = handleObjectRef(hsl['format-script']);
                        if (hsl.publisher) qoeReprt.highSpeedLogPublisher = handleObjectRef(hsl.publisher);
                        ruleObj.qoeReporting = qoeReprt;
                    }

                    // quota
                    if (origRule.quota) ruleObj.quota = { reportingLevel: origRule.quota['reporting-level'] };

                    // qosBandwidthControllerDownlink
                    if (origRule['qos-rate-pir-downlink']) {
                        const qosSplit = origRule['qos-rate-pir-downlink'].split('->');
                        ruleObj.qosBandwidthControllerDownlink = {
                            category: qosSplit[1],
                            policy: handleObjectRef(qosSplit[0])
                        };
                    }

                    if (origRule['qos-rate-pir-uplink']) {
                        const qosSplit = origRule['qos-rate-pir-uplink'].split('->');
                        ruleObj.qosBandwidthControllerUplink = {
                            category: qosSplit[1],
                            policy: handleObjectRef(qosSplit[0])
                        };
                    }

                    // ranCongestion
                    const ranCongest = origRule['ran-congestion'];
                    if (ranCongest) {
                        const ran = {};
                        if (ranCongest['lowerthreshold-bw']) ran.threshold = parseInt(ranCongest['lowerthreshold-bw'], 10);

                        if (ranCongest.report && ranCongest.report.dest && ranCongest.report.dest.hsl) {
                            const dest = {};
                            if (ranCongest.report.dest.hsl['format-script']) {
                                dest.formatScript = handleObjectRef(ranCongest.report.dest.hsl['format-script']);
                            }
                            if (ranCongest.report.dest.hsl.publisher) {
                                dest.highSpeedLogPublisher = handleObjectRef(ranCongest.report.dest.hsl.publisher);
                            }
                            ran.reportDestinationHsl = dest;
                        }
                        ruleObj.ranCongestion = ran;
                    }

                    // usageReporting
                    const usage = origRule.reporting;
                    if (usage) {
                        let obj = {};

                        if (usage.dest) {
                            const destKeys = Object.keys(usage.dest).map((y) => {
                                const dest = usage.dest[y];
                                const destObj = { destination: y };
                                if (dest['application-reporting']) destObj.applicationReportingEnabled = dest['application-reporting'] === 'enabled';
                                if (dest['monitoring-key']) destObj.monitoringKey = dest['monitoring-key'];
                                return destObj;
                            });
                            obj = Object.assign(destKeys[0], obj);
                        }

                        if (usage.volume) {
                            const vol = {};
                            if (usage.volume.downlink) vol.downlink = parseInt(usage.volume.downlink, 10);
                            if (usage.volume.total) vol.total = parseInt(usage.volume.total, 10);
                            if (usage.volume.uplink) vol.uplink = parseInt(usage.volume.uplink, 10);
                            obj.volume = vol;
                        }

                        ruleObj.usageReporting = obj;
                    }

                    // urlCategorizationFilters
                    const urlFilter = origRule['url-categorization-filters'];
                    if (urlFilter) {
                        ruleObj.urlCategorizationFilters = Object.keys(urlFilter).map((y) => {
                            const obj = urlFilter[y];
                            return {
                                name: y,
                                category: handleObjectRef(obj['url-category']),
                                invertMatch: obj.operation === 'nomatch'
                            };
                        });
                    }

                    // DTOSTethering
                    const tether = origRule['dtos-tethering'];
                    if (tether) {
                        const obj = {};
                        if (tether['dtos-detect']) obj.detectDtos = tether['dtos-detect'] === 'enabled';
                        if (tether['tethering-detect']) obj.detectTethering = tether['tethering-detect'] === 'enabled';

                        if (tether.report && tether.report.dest && tether.report.dest.hsl) {
                            const dest = {};
                            if (tether.report.dest.hsl['format-script']) {
                                dest.formatScript = handleObjectRef(tether.report.dest.hsl['format-script']);
                            }
                            if (tether.report.dest.hsl.publisher) {
                                dest.highSpeedLogPublisher = handleObjectRef(tether.report.dest.hsl.publisher);
                            }
                            obj.reportDestinationHsl = dest;
                        }
                        ruleObj.DTOSTethering = obj;
                    }

                    return ruleObj;
                });
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Enforcement_Listener
    'pem listener': {
        class: 'Enforcement_Listener',

        keyValueRemaps: {
            enforcementProfile: (key, val) => ({ enforcementProfile: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            services: (key, val) => ({ services: Object.keys(val).map((x) => handleObjectRef(x)) })
        }
    }
};
