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

const handleObjectRef = require('../../../util/convert/handleObjectRef');
const hyphensToCamel = require('../../../util/convert/hyphensToCamel');
const isIPv4 = require('../../../util/convert/isIPv4');
const returnEmptyObjIfNone = require('../../../util/convert/returnEmptyObjIfNone');
const unquote = require('../../../util/convert/unquote');

const reparse = (str) => str.replace(/{/g, '').replace(/}/g, '')
    .split('"')
    .map((x) => x.trim())
    .filter((x) => x);

module.exports = {

    // DOS_Profile
    'security dos profile': {
        class: 'DOS_Profile',

        keyValueRemaps: {
            applicationAllowlist: (key, val) => {
                if (val === 'none') return {};
                return { applicationAllowlist: handleObjectRef(val) };
            },

            allowlist: (key, val) => returnEmptyObjIfNone(val, { allowlist: handleObjectRef(val) })
        },

        customHandling: (rootObj, loc) => {
            if (rootObj.remark) rootObj.remark = unquote(rootObj.remark);
            const newObj = {};

            // application
            if (rootObj.application) {
                const appKeys = Object.keys(rootObj.application);
                const app = rootObj.application[appKeys[0]];
                const newApp = {};

                if (app['single-page-application']) {
                    newApp.singlePageApplicationEnabled = app['single-page-application'] === 'enabled';
                }
                if (app['rtbh-duration-sec'] && app['rtbh-enable'] === 'enabled') {
                    newApp.remoteTriggeredBlackHoleDuration = parseInt(app['rtbh-duration-sec'], 10);
                }
                if (app['scrubbing-duration-sec'] && app['scrubbing-enable'] === 'enabled') {
                    newApp.scrubbingDuration = parseInt(app['scrubbing-duration-sec'], 10);
                }

                if (app['fastl4-acceleration-profile']) {
                    newApp.profileAcceleration = handleObjectRef(app['fastl4-acceleration-profile']);
                }

                if (app['trigger-irule']) {
                    newApp.triggerIRule = app['trigger-irule'] === 'enabled';
                }

                // geolocations
                if (app.geolocations) {
                    newApp.denylistedGeolocations = [];
                    newApp.allowlistedGeolocations = [];
                    const geoKeys = Object.keys(app.geolocations);
                    for (let i = 0; i < geoKeys.length; i += 1) {
                        const key = geoKeys[i];
                        const subKeys = Object.keys(app.geolocations[key]);
                        if (subKeys.includes('white-listed')) {
                            newApp.allowlistedGeolocations.push(unquote(key));
                        } else {
                            newApp.denylistedGeolocations.push(unquote(key));
                        }
                    }
                }

                // botDefense
                const botDefense = app['bot-defense'];
                if (botDefense) {
                    const botDef = {};
                    if (botDefense['cross-domain-requests']) {
                        botDef.crossDomainRequests = botDefense['cross-domain-requests'];
                    }
                    if (botDefense['external-domains']) {
                        botDef.externalDomains = botDefense['external-domains'];
                    }
                    if (botDefense['grace-period']) {
                        botDef.gracePeriod = parseInt(botDefense['grace-period'], 10);
                    }
                    if (botDefense.mode) botDef.mode = botDefense.mode;
                    if (botDefense['site-domains']) {
                        botDef.siteDomains = botDefense['site-domains'];
                    }
                    if (botDefense['url-whitelist']) {
                        botDef.urlAllowlist = botDefense['url-whitelist'];
                    }
                    if (botDefense['browser-legit-captcha']) {
                        botDef.issueCaptchaChallenge = botDefense['browser-legit-captcha'] === 'enabled';
                    }
                    newApp.botDefense = botDef;
                }

                // botSignatures
                const botSignatures = app['bot-signatures'];
                if (botSignatures) {
                    const botSig = {};

                    if (botSignatures.check) {
                        botSig.checkingEnabled = botSignatures.check === 'enabled';
                    }

                    if (botSignatures['disabled-signatures']) {
                        botSig.disabledSignatures = Object.keys(botSignatures['disabled-signatures'])
                            .map((x) => ({ bigip: unquote(x) }));
                    }

                    // categories
                    if (botSignatures.categories) {
                        const catKeys = Object.keys(botSignatures.categories);
                        const blocked = [];
                        const reported = [];
                        for (let i = 0; i < catKeys.length; i += 1) {
                            if (botSignatures.categories[catKeys[i]].action === 'block') {
                                blocked.push({ bigip: unquote(catKeys[i]) });
                            }
                            if (botSignatures.categories[catKeys[i]].action === 'report') {
                                reported.push({ bigip: unquote(catKeys[i]) });
                            }
                        }
                        if (blocked.length) botSig.blockedCategories = blocked;
                        if (reported.length) botSig.reportedCategories = reported;
                    }

                    newApp.botSignatures = botSig;
                }

                // captcha-response
                const captchaRes = app['captcha-response'];
                if (captchaRes) {
                    newApp.captchaResponse = {
                        failure: unquote(captchaRes.failure.body),
                        first: unquote(captchaRes.first.body)
                    };
                }

                // heavy-urls
                const heavy = app['heavy-urls'];
                if (heavy) {
                    const heavyURL = {};
                    if (heavy.exclude) heavyURL.excludeList = heavy.exclude;
                    if (heavy['latency-threshold']) heavyURL.detectionThreshold = parseInt(heavy['latency-threshold'], 10);
                    if (heavy['include-list']) {
                        heavyURL.protectList = Object.keys(heavy['include-list'])
                            .map((x) => ({ url: heavy['include-list'][x].url, threshold: parseInt(x, 10) }));
                    }
                    if (heavy['automatic-detection']) {
                        heavyURL.automaticDetectionEnabled = heavy['automatic-detection'] === 'enabled';
                    }
                    if (Object.keys(heavyURL).length) newApp.heavyURLProtection = heavyURL;
                }

                // mobile-detection
                const mobileDetect = app['mobile-detection'];
                if (mobileDetect) {
                    const mobileDef = {};

                    if (mobileDetect.enabled) mobileDef.enabled = mobileDetect.enabled === 'enabled';
                    if (mobileDetect['allow-android-rooted-device']) {
                        mobileDef.allowAndroidRootedDevice = mobileDetect['allow-android-rooted-device'] === 'true';
                    }
                    if (mobileDetect['allow-emulators']) {
                        mobileDef.allowEmulators = mobileDetect['allow-emulators'] === 'true';
                    }
                    if (mobileDetect['allow-jailbroken-devices']) {
                        mobileDef.allowJailbrokenDevices = mobileDetect['allow-jailbroken-devices'] === 'true';
                    }
                    if (mobileDetect['ios-allowed-package-names']) {
                        mobileDef.allowIosPackageNames = mobileDetect['ios-allowed-package-names'];
                    }
                    if (mobileDetect['client-side-challenge-mode'] === 'cshui') {
                        mobileDef.clientSideChallengeMode = 'challenge';
                    }
                    if (mobileDetect['android-publishers']) {
                        mobileDef.allowAndroidPublishers = Object.keys(mobileDetect['android-publishers'])
                            .map((x) => handleObjectRef(x));
                    }

                    // only attach if keys present
                    if (Object.keys(mobileDef).length) newApp.mobileDefense = mobileDef;
                }

                // recordTraffic
                const recordTraffic = app['tcp-dump'];
                if (recordTraffic) {
                    const traf = {};
                    if (recordTraffic['maximum-duration']) traf.maximumDuration = parseInt(recordTraffic['maximum-duration'], 10);
                    if (recordTraffic['maximum-size']) traf.maximumSize = parseInt(recordTraffic['maximum-size'], 10);
                    if (recordTraffic['repetition-interval']) traf.repetitionInterval = parseInt(recordTraffic['repetition-interval'], 10);
                    if (recordTraffic['record-traffic']) traf.recordTrafficEnabled = recordTraffic['record-traffic'] === 'enabled';
                    if (Object.keys(traf).length) newApp.recordTraffic = traf;
                }

                const dosProf = (conf, prefix) => {
                    const obj = {};
                    if (conf[`${prefix}-captcha-challenge`]) obj.captchaChallengeEnabled = conf[`${prefix}-captcha-challenge`] === 'enabled';
                    if (conf[`${prefix}-client-side-defense`]) obj.clientSideDefenseEnabled = conf[`${prefix}-client-side-defense`] === 'enabled';
                    if (conf[`${prefix}-enable-heavy`]) obj.heavyURLProtectionEnabled = conf[`${prefix}-enabled-heavy`] === 'enabled';

                    if (conf[`${prefix}-maximum-auto-tps`]) obj.maximumAutoTps = parseInt(conf[`${prefix}-maximum-auto-tps`], 10);
                    if (conf[`${prefix}-minimum-auto-tps`]) obj.minimumAutoTps = parseInt(conf[`${prefix}-minimum-auto-tps`], 10);
                    if (conf[`${prefix}-maximum-tps`]) obj.maximumTps = parseInt(conf[`${prefix}-maximum-tps`], 10);
                    if (conf[`${prefix}-minimum-tps`]) obj.minimumTps = parseInt(conf[`${prefix}-minimum-tps`], 10);
                    if (conf[`${prefix}-tps-increase-rate`]) obj.tpsIncreaseRate = parseInt(conf[`${prefix}-tps-increase-rate`], 10);
                    if (conf[`${prefix}-minimum-share`]) obj.minimumShare = parseInt(conf[`${prefix}-minimum-share`], 10);
                    if (conf[`${prefix}-share-increase-rate`]) obj.shareIncreaseRate = parseInt(conf[`${prefix}-share-increase-rate`], 10);

                    if (conf[`${prefix}-rate-limiting`]) obj.rateLimitingEnabled = conf[`${prefix}-rate-limiting`] === 'enabled';
                    if (conf[`${prefix}-request-blocking-mode`]) obj.rateLimitingMode = conf[`${prefix}-request-blocking-mode`];

                    return obj;
                };

                // tps-based -> rateBasedDetection
                const tps = app['tps-based'];
                if (tps) {
                    const rate = {};
                    if (tps.mode) rate.operationMode = tps.mode;
                    rate.thresholdsMode = tps['thresholds-mode'] || 'manual';
                    if (tps['escalation-period']) rate.escalationPeriod = parseInt(tps['escalation-period'], 10);
                    if (tps['de-escalation-period']) rate.deEscalationPeriod = parseInt(tps['de-escalation-period'], 10);

                    const src = dosProf(tps, 'ip');
                    const dev = dosProf(tps, 'device');
                    const geo = dosProf(tps, 'geo');
                    const site = dosProf(tps, 'site');
                    const url = dosProf(tps, 'url');
                    if (Object.keys(src).length) rate.sourceIP = src;
                    if (Object.keys(dev).length) rate.deviceID = dev;
                    if (Object.keys(geo).length) rate.geolocation = geo;
                    if (Object.keys(site).length) rate.site = site;
                    if (Object.keys(url).length) rate.url = url;

                    if (Object.keys(rate).length) newApp.rateBasedDetection = rate;
                }

                // stress-based -> stressBasedDetection
                const strs = app['stress-based'];
                if (strs) {
                    const stress = {};
                    stress.thresholdsMode = strs['thresholds-mode'] || 'manual';
                    if (strs.mode) stress.operationMode = strs.mode;
                    if (strs['escalation-period']) stress.escalationPeriod = parseInt(strs['escalation-period'], 10);
                    if (strs['de-escalation-period']) stress.deEscalationPeriod = parseInt(strs['de-escalation-period'], 10);

                    // badActor
                    const behave = strs.behavioral;
                    if (behave) {
                        const badActor = {};
                        if (behave['signatures-approved-only']) badActor.useApprovedSignaturesOnly = behave['signatures-approved-only'] === 'enabled';
                        if (behave['dos-detection']) badActor.detectionEnabled = behave['dos-detection'] === 'enabled';
                        if (behave.signatures) badActor.signatureDetectionEnabled = behave.signatures === 'enabled';
                        if (behave['mitigation-mode']) badActor.mitigationMode = behave['mitigation-mode'];
                        if (Object.keys(badActor).length) stress.badActor = badActor;
                    }

                    const src = dosProf(strs, 'ip');
                    const dev = dosProf(strs, 'device');
                    const geo = dosProf(strs, 'geo');
                    const site = dosProf(strs, 'site');
                    const url = dosProf(strs, 'url');
                    if (Object.keys(src).length) stress.sourceIP = src;
                    if (Object.keys(dev).length) stress.deviceID = dev;
                    if (Object.keys(geo).length) stress.geolocation = geo;
                    if (Object.keys(site).length) stress.site = site;
                    if (Object.keys(url).length) stress.url = url;
                    if (Object.keys(stress).length) newApp.stressBasedDetection = stress;
                }

                rootObj.application = newApp;
            }

            // network
            const network = rootObj.network;
            if (rootObj.network) {
                const net = {};
                const netKey = Object.keys(network)[0];
                const dynSig = rootObj.network[netKey]['dynamic-signatures'];
                if (dynSig) {
                    net.dynamicSignatures = {
                        detectionMode: dynSig.detection,
                        mitigationMode: dynSig.mitigation,
                        scrubbingCategory: handleObjectRef(dynSig['scrubber-category']),
                        scrubbingDuration: parseInt(dynSig['scrubber-advertisement-period'], 10),
                        scrubbingEnabled: dynSig['scrubber-enable'] === 'yes'
                    };
                }

                const attVector = rootObj.network[netKey]['network-attack-vector'];
                if (attVector) {
                    net.vectors = Object.keys(attVector).map((x) => {
                        const vector = attVector[x];
                        return {
                            autoDenylistSettings: {
                                enabled: vector['auto-blacklisting'] === 'enabled',
                                category: handleObjectRef(vector['blacklist-category']),
                                attackDetectionTime: parseInt(vector['blacklist-detection-seconds'], 10),
                                categoryDuration: parseInt(vector['blacklist-duration'], 10),
                                externalAdvertisementEnabled: vector['allow-advertisement'] === 'enabled'
                            },
                            badActorSettings: {
                                enabled: vector['bad-actor'] === 'enabled',
                                sourceDetectionThreshold: parseInt(vector['per-source-ip-detection-pps'], 10),
                                sourceMitigationThreshold: parseInt(vector['per-source-ip-limit-pps'], 10)
                            },
                            rateIncreaseThreshold: parseInt(vector['rate-increase'], 10),
                            rateLimit: parseInt(vector['rate-limit'], 10),
                            rateThreshold: parseInt(vector['rate-threshold'], 10),
                            simulateAutoThresholdEnabled: vector['simulate-auto-threshold'] === 'enabled',
                            state: vector.state,
                            type: x
                        };
                    });
                }
                rootObj.network = net;
            }

            // protocolDNS
            const protoDNS = rootObj.protocolDNS;
            if (protoDNS) {
                const vectArr = [];
                const dnsKeys = Object.keys(protoDNS);
                for (let i = 0; i < dnsKeys.length; i += 1) {
                    const dnsKey = dnsKeys[i];
                    const keyObj = protoDNS[dnsKey];
                    const vect = keyObj['dns-query-vector'];
                    if (vect) {
                        const vectObj = Object.keys(vect).map((x) => {
                            const obj = {
                                type: x,
                                state: vect[x].state || 'mitigate'
                            };

                            if (vect[x]['rate-increase']) obj.rateIncreaseThreshold = parseInt(vect[x]['rate-increase'], 10);

                            if (vect[x]['threshold-mode']) obj.thresholdMode = vect[x]['threshold-mode'];

                            // 'infinite' == 4294967295
                            if (vect[x].ceiling === 'infinite') {
                                obj.autoAttackCeiling = 4294967295;
                            } else {
                                obj.autoAttackCeiling = parseInt(vect[x].ceiling, 10);
                            }
                            if (vect[x].floor === 'infinite') {
                                obj.autoAttackFloor = 4294967295;
                            } else {
                                obj.autoAttackFloor = parseInt(vect[x].floor, 10);
                            }
                            return obj;
                        });
                        vectArr.push(vectObj[0]);
                    }
                }
                rootObj.protocolDNS = { vectors: vectArr };
            }

            // protocolSIP
            const protoSIP = rootObj.protocolSIP;
            if (protoSIP) {
                const vectArr = [];
                Object.keys(protoSIP).forEach((sipKey) => {
                    const keyObj = protoSIP[sipKey];
                    const vect = keyObj['sip-attack-vector'];
                    if (vect) {
                        const vectObj = Object.keys(vect).map((x) => {
                            const obj = {
                                type: x,
                                state: vect[x].state || 'mitigate'
                            };

                            if (vect[x]['rate-increase']) obj.rateIncreaseThreshold = parseInt(vect[x]['rate-increase'], 10);

                            if (vect[x]['threshold-mode']) obj.thresholdMode = vect[x]['threshold-mode'];

                            // 'infinite' == 4294967295
                            if (vect[x].ceiling === 'infinite') {
                                obj.autoAttackCeiling = 4294967295;
                            } else {
                                obj.autoAttackCeiling = parseInt(vect[x].ceiling, 10);
                            }
                            if (vect[x].floor === 'infinite') {
                                obj.autoAttackFloor = 4294967295;
                            } else {
                                obj.AutoAttackFloor = parseInt(vect[x].floor, 10);
                            }
                            return obj;
                        });
                        vectArr.push(vectObj[0]);
                    }
                });
                rootObj.protocolSIP = { vectors: vectArr };
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // NAT_Policy
    'security nat policy': {
        class: 'NAT_Policy',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // rules
            const rules = rootObj.rules;
            if (rules) {
                rootObj.rules = Object.keys(rules).map((x) => {
                    const rule = rootObj.rules[x];
                    const newRule = { name: x };

                    if (rule['ip-protocol']) newRule.protocol = rule['ip-protocol'];

                    if (rule['log-profile']) newRule.securityLogProfile = handleObjectRef(rule['log-profile']);

                    if (rule.destination) {
                        const dest = {};
                        if (rule.destination['address-lists']) {
                            dest.addressLists = Object.keys(rule.destination['address-lists'])
                                .map((y) => handleObjectRef(y));
                        }
                        if (rule.destination['port-lists']) {
                            dest.portLists = Object.keys(rule.destination['port-lists'])
                                .map((y) => handleObjectRef(y));
                        }
                        newRule.destination = dest;
                    }

                    if (rule.source) {
                        const dest = {};
                        if (rule.source['address-lists']) {
                            dest.addressLists = Object.keys(rule.source['address-lists'])
                                .map((y) => handleObjectRef(y));
                        }
                        if (rule.source['port-lists']) {
                            dest.portLists = Object.keys(rule.source['port-lists'])
                                .map((y) => handleObjectRef(y));
                        }
                        newRule.source = dest;
                    }

                    if (rule.translation) newRule.sourceTranslation = handleObjectRef(rule.translation.source);

                    return newRule;
                });
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // NAT_Source_Translation
    'security nat source-translation': {
        class: 'NAT_Source_Translation',

        keyValueRemaps: {
            addresses: (key, val) => ({ addresses: Object.keys(val) }),

            egressInterfaces: (key, val) => ({
                allowEgressInterfaces: Object.keys(val)
                    .map((x) => handleObjectRef(x))
            }),

            egressInterfacesDisabled: () => ({}),

            egressInterfacesEnabled: () => ({}),

            ports: (key, val) => ({ ports: Object.keys(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // mapping
            if (rootObj.mode && rootObj.timeout) {
                rootObj.mapping = {
                    mode: rootObj.mode,
                    timeout: rootObj.timeout
                };
            }
            delete rootObj.mode;
            delete rootObj.timeout;

            // portBlockAllocation
            if (rootObj.patMode === 'pba') {
                const pba = {};
                if (rootObj.blockIdleTimeout) pba.blockIdleTimeout = rootObj.blockIdleTimeout;
                if (rootObj.blockLifetime) pba.blockLifetime = rootObj.blockLifetime;
                if (rootObj.blockSize) pba.blockSize = rootObj.blockSize;
                if (rootObj.clientBlockLimit) pba.clientBlockLimit = rootObj.clientBlockLimit;
                if (rootObj.zombieTimeout) pba.zombieTimeout = rootObj.zombieTimeout;

                if (Object.keys(pba).length) rootObj.portBlockAllocation = pba;
            }

            // excludeAddresses
            const excludeArr = [];
            if (rootObj.excludeAddresses) {
                Object.keys(rootObj.excludeAddresses).forEach((x) => excludeArr.push(x));
            }
            if (rootObj.excludeAddressLists) {
                Object.keys(rootObj.excludeAddressLists).forEach((x) => excludeArr.push(handleObjectRef(x)));
                delete rootObj.excludeAddressLists;
            }
            rootObj.excludeAddresses = excludeArr;

            delete rootObj.blockIdleTimeout;
            delete rootObj.blockLifetime;
            delete rootObj.blockSize;
            delete rootObj.clientBlockLimit;
            delete rootObj.zombieTimeout;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Protocol_Inspection_Profile
    'security protocol-inspection profile': {
        class: 'Protocol_Inspection_Profile',

        customHandling: (rootObj, loc) => {
            if (rootObj.remark) rootObj.remark = unquote(rootObj.remark);
            const newObj = {};

            if (rootObj.services) {
                // services
                rootObj.services = Object.keys(rootObj.services).map((x) => {
                    const origService = rootObj.services[x];
                    const newService = { type: x.split('/')[2] };

                    const parseLtmPolicyChecks = (obj) => {
                        if (obj) {
                            obj = Object.keys(obj).map((c) => {
                                const origObj = obj[c];
                                const retObj = { check: c.split('/')[2] };
                                if (origObj.action) {
                                    retObj.action = origObj.action;
                                }
                                if (origObj.log) {
                                    if (origObj.log === 'yes') retObj.log = true;
                                    if (origObj.log === 'no') retObj.log = false;
                                }
                                if (origObj.value) {
                                    retObj.value = unquote(origObj.value);
                                }
                                return retObj;
                            });
                            return obj;
                        }
                        return [];
                    };

                    // compliance
                    newService.compliance = parseLtmPolicyChecks(origService.compliance);

                    // signature
                    newService.signature = parseLtmPolicyChecks(origService.signature);

                    // ports
                    if (origService.ports) {
                        newService.ports = Object.keys(origService.ports).map((val) => parseInt(val, 10));
                    }

                    return newService;
                });
            }

            delete rootObj.defaultFromProfile;
            newObj[loc.profile] = rootObj;
            return newObj;
        }

    },

    // Security_Log_Profile
    'security log profile': {
        class: 'Security_Log_Profile',

        keyValueRemaps: {

            dosApplication: (key, val) => {
                const obj = val[Object.keys(val)[0]];
                if (Object.keys(obj).length !== 0) {
                    const oldKey = Object.keys(obj)[0];
                    const newKey = hyphensToCamel(oldKey);
                    const ref = obj[oldKey].includes('Common') ? obj[oldKey] : '/Common/'.concat(obj[oldKey]);
                    const newObj = {};
                    newObj[newKey] = handleObjectRef(unquote(ref));
                    return { dosApplication: newObj };
                }
                return {};
            },

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // application
            if (rootObj.application) {
                const key = Object.keys(rootObj.application)[0];
                const obj = rootObj.application[key];
                const search = Object.keys(obj.filter).filter((x) => x.includes('search-'))[0];

                const app = {};
                if (obj['guarantee-logging']) app.guaranteeLoggingEnabled = obj['guarantee-logging'] === 'enabled';
                if (obj['guarantee-response-logging']) app.guaranteeResponseLoggingEnabled = obj['guarantee-response-logging'] === 'enabled';
                if (obj['maximum-header-size']) app.maxHeaderSize = parseInt(obj['maximum-header-size'], 10);
                if (obj['maximum-query-size']) app.maxQuerySize = parseInt(obj['maximum-query-size'], 10);
                if (obj['maximum-request-size']) app.maxRequestSize = parseInt(obj['maximum-request-size'], 10);
                if (obj['response-logging']) app.responseLogging = obj['response-logging'];

                if (obj['maximum-entry-length']) app.maxEntryLength = obj['maximum-entry-length'];
                if (obj.facility) app.facility = obj.facility;
                if (obj['local-storage']) app.localStorage = obj['local-storage'] === 'enabled';
                if (obj.protocol) app.protocol = obj.protocol;
                if (obj['remote-storage']) app.remoteStorage = obj['remote-storage'];
                if (obj['report-anomalies']) app.reportAnomaliesEnabled = obj['report-anomalies'] === 'enabled';

                if (obj.servers) {
                    app.servers = Object.keys(obj.servers).map((x) => {
                        const ip4 = isIPv4(x);
                        const spltr = ip4 ? ':' : '.';
                        const split = x.split(spltr);
                        return {
                            address: split[0],
                            port: split[1]
                        };
                    });
                }

                rootObj.application = app;

                // application.storageFilter
                if (obj.filter) {
                    const filter = obj.filter;
                    const storageFilter = {};
                    if (filter['http-method']) storageFilter.httpMethods = filter['http-method'].values;
                    if (obj['logic-operation']) storageFilter.logicalOperation = obj['logic-operation'];
                    if (filter['login-result']) storageFilter.loginResults = filter['login-result'].values;
                    if (filter.protocol) storageFilter.protocols = filter.protocol.values;
                    if (filter[search]) {
                        storageFilter.requestContains = { searchIn: search };
                        if (filter[search].values) {
                            if (Array.isArray(filter[search].values)) {
                                storageFilter.requestContains.value = filter[search].values.join(' ');
                            } else {
                                storageFilter.requestContains.value = reparse(filter[search].values)[0];
                            }
                        }
                    }
                    if (filter['request-type']) storageFilter.requestType = filter['request-type'].values[0];
                    if (filter['response-code']) storageFilter.responseCodes = filter['response-code'].values;

                    rootObj.application.storageFilter = storageFilter;
                }

                // application.storageFormat
                if (obj.format) {
                    const format = obj.format;
                    const formObj = {};
                    if (format['field-delimiter']) formObj.delimiter = format['field-delimiter'];
                    if (format.fields) formObj.fields = format.fields;
                    rootObj.application.storageFormat = formObj;
                }
            }

            // network
            if (rootObj.network) {
                const key = Object.keys(rootObj.network)[0];
                const obj = rootObj.network[key];
                const net = {};

                if (obj.publisher) net.publisher = handleObjectRef(obj.publisher);
                if (obj.format) {
                    if (obj.format['field-list']) {
                        net.storageFormat = { fields: obj.format['field-list'].map((x) => x.replace(/_/g, '-')) };
                    }
                    if (obj.format['user-defined']) {
                        net.storageFormat = unquote(obj.format['user-defined']);
                    }
                }

                if (obj.filter) {
                    if (obj.filter['log-acl-match-accept']) net.logRuleMatchAccepts = obj.filter['log-acl-match-accept'] === 'enabled';
                    if (obj.filter['log-acl-match-reject']) net.logRuleMatchRejects = obj.filter['log-acl-match-reject'] === 'enabled';
                    if (obj.filter['log-acl-match-drop']) net.logRuleMatchDrops = obj.filter['log-acl-match-drop'] === 'enabled';
                    if (obj.filter['log-ip-errors']) net.logIpErrors = obj.filter['log-ip-errors'] === 'enabled';
                    if (obj.filter['log-tcp-errors']) net.logTcpErrors = obj.filter['log-tcp-errors'] === 'enabled';
                    if (obj.filter['log-tcp-events']) net.logTcpEvents = obj.filter['log-tcp-events'] === 'enabled';
                    if (obj.filter['log-translation-fields']) net.logTranslationFields = obj.filter['log-translation-fields'] === 'enabled';
                }

                rootObj.network = net;
            }

            // botDefense
            if (rootObj.botDefense) {
                const botDefense = rootObj.botDefense;
                const botDef = {};

                const fields = botDefense[Object.keys(botDefense)[0]];

                Object.keys(fields.filter).forEach((filterKey) => {
                    botDef[hyphensToCamel(filterKey)] = fields.filter[filterKey] === 'enabled';
                });

                Object.keys(fields).forEach((objKey) => {
                    if (objKey !== 'filter') {
                        botDef[hyphensToCamel(objKey)] = handleObjectRef(fields[objKey]);
                    }
                });

                rootObj.botDefense = botDef;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // SSH_Proxy_Profile
    'security ssh profile': {
        class: 'SSH_Proxy_Profile',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // sshProfileDefaultActions
            if (rootObj.sshProfileDefaultActions) {
                const tempObj = {};
                const name = Object.keys(rootObj.sshProfileDefaultActions)[0];
                const keys = Object.keys(rootObj.sshProfileDefaultActions[name]);
                tempObj.name = name;
                for (let i = 0; i < keys.length; i += 1) {
                    const key = keys[i];
                    const newKey = hyphensToCamel(key);
                    tempObj[newKey] = rootObj.sshProfileDefaultActions[name][key];
                    tempObj[newKey].log = tempObj[newKey].log === 'yes';
                }
                rootObj.sshProfileDefaultActions = tempObj;
            }

            // sshProfileRuleSet
            if (rootObj.sshProfileRuleSet) {
                const keys = Object.keys(rootObj.sshProfileRuleSet);
                const tempArr = [];

                for (let i = 0; i < keys.length; i += 1) {
                    const tempObj = {};
                    const name = keys[i];
                    const obj = rootObj.sshProfileRuleSet[name];

                    const custKeys = Object.keys(obj.actions);
                    for (let j = 0; j < custKeys.length; j += 1) {
                        const custKey = custKeys[j];
                        const actionKeys = Object.keys(obj.actions[custKey]);

                        const actions = {};
                        for (let k = 0; k < actionKeys.length; k += 1) {
                            const actionKey = actionKeys[k];
                            const newKey = hyphensToCamel(actionKey);

                            const action = obj.actions[custKey][actionKey];
                            if (action.control !== 'unspecified' && action.log !== 'no') {
                                actions[newKey] = action;
                                actions[newKey].log = actions[newKey].log === 'yes';
                            }
                            actions.name = custKey;
                        }

                        tempObj.name = name;
                        tempObj.sshProfileRuleActions = actions;
                        tempObj.remark = unquote(obj.description);
                        tempObj.sshProfileIdGroups = reparse(obj['identity-groups']);
                        tempObj.sshProfileIdUsers = reparse(obj['identity-users']);

                        tempArr.push(tempObj);
                    }
                }
                rootObj.sshProfileRuleSet = tempArr;
            }

            // sshProfileAuthInfo
            if (rootObj.sshProfileAuthInfo) {
                const arr = [];
                const keys = Object.keys(rootObj.sshProfileAuthInfo);

                for (let i = 0; i < keys.length; i += 1) {
                    const tempObj = {};
                    const name = keys[i];

                    const obj = rootObj.sshProfileAuthInfo[name];
                    tempObj.name = name;

                    // proxyClientAuth
                    if (obj['proxy-client-auth']) {
                        tempObj.proxyClientAuth = {};
                        const privateKey = obj['proxy-client-auth']['private-key'];
                        if (privateKey) {
                            tempObj.proxyClientAuth.privateKey = {
                                ciphertext: Buffer.from(privateKey).toString('base64'),
                                ignoreChanges: true
                            };
                        }
                        const publicKey = obj['proxy-client-auth']['public-key'];
                        if (publicKey) {
                            tempObj.proxyClientAuth.publicKey = unquote(publicKey);
                        }
                    }

                    // proxyServerAuth
                    if (obj['proxy-server-auth']) {
                        tempObj.proxyServerAuth = {};
                        const privateKey = obj['proxy-server-auth']['private-key'];
                        if (privateKey) {
                            tempObj.proxyServerAuth.privateKey = {
                                ciphertext: Buffer.from(privateKey).toString('base64'),
                                ignoreChanges: true
                            };
                        }
                        const publicKey = obj['proxy-server-auth']['public-key'];
                        if (publicKey) {
                            tempObj.proxyServerAuth.publicKey = unquote(publicKey);
                        }
                    }

                    // realServerAuth
                    if (obj['real-server-auth']) {
                        tempObj.realServerAuth = {};
                        const privateKey = obj['real-server-auth']['private-key'];
                        if (privateKey) {
                            tempObj.realServerAuth.privateKey = {
                                ciphertext: Buffer.from(privateKey).toString('base64'),
                                ignoreChanges: true
                            };
                        }
                        const publicKey = obj['real-server-auth']['public-key'];
                        if (publicKey) {
                            tempObj.realServerAuth.publicKey = unquote(publicKey);
                        }
                    }

                    arr.push(tempObj);
                }
                rootObj.sshProfileAuthInfo = arr;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
