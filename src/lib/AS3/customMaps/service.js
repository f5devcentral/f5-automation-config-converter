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

const path = require('path');
const enabledToEnable = require('../../../util/convert/enabledToEnable');
const getCidrFromNetmask = require('../../../util/convert/getCidrFromNetmask');
const getObjectType = require('../../../util/convert/getObjectType');
const handleObjectRef = require('../../../util/convert/handleObjectRef');
const isIPv4 = require('../../../util/convert/isIPv4');
const isIPv6 = require('../../../util/convert/isIPv6');
const log = require('../../../util/log');
const portDict = require('../../portDict.json');
const returnEmptyObjIfNone = require('../../../util/convert/returnEmptyObjIfNone');
const unquote = require('../../../util/convert/unquote');

const handleSharedPath = (propertyPath) => {
    const splitPath = propertyPath.split('/');
    const tenant = splitPath[1];
    const application = splitPath[2];
    if (splitPath.length === 3) {
        propertyPath = propertyPath.replace(`/${tenant}/`, `/${tenant}/Shared/`);
    } else if (tenant === 'Common' && application.includes('.app')) {
        propertyPath = propertyPath.replace(`/${tenant}/${application}/`, `/${tenant}/Shared/`);
    }
    return propertyPath;
};

const isTypeInProfiles = (profiles, type, file) => {
    for (let i = 0; i < profiles.length; i += 1) {
        const profile = profiles[i];
        if (getObjectType(profile, file) === type) return true;
    }
    return false;
};

const getServiceType = (obj, file) => {
    const profs = Object.keys(obj);
    let service;

    // Service_HTTP/Service_HTTPS
    if (isTypeInProfiles(profs, 'http', file)) {
        if (isTypeInProfiles(profs, 'client-ssl', file)) {
            service = { class: 'Service_HTTPS', template: 'https' };
        } else {
            service = { class: 'Service_HTTP', template: 'http' };
        }
    } else if (isTypeInProfiles(profs, 'udp', file)) {
        // Service_UDP
        service = { class: 'Service_UDP', template: 'udp' };
    } else if (isTypeInProfiles(profs, 'fastl4', file)) {
        // Service_L4
        service = { class: 'Service_L4', template: 'l4' };
    } else if (isTypeInProfiles(profs, 'tcp', file)) {
        // Service_TCP
        service = { class: 'Service_TCP', template: 'tcp' };
    } else if (isTypeInProfiles(profs, 'sctp', file)) {
        // Service_SCTP
        service = { class: 'Service_SCTP', template: 'sctp' };
    } else {
        // Service_Generic
        service = { class: 'Service_Generic', template: 'generic' };
    }

    // Determine if any profiles attached
    const serviceProfileProperties = {
        'bot-defense': 'profileBotDefense',
        'client-ssl': 'serverTLS',
        'diameter-endpoint': 'profileDiameterEndpoint',
        'http-compression': 'profileHTTPCompression',
        'one-connect': 'profileMultiplex',
        'protocol-inspection': 'profileProtocolInspection',
        'request-adapt': 'profileRequestAdapt',
        'request-log': 'profileTrafficLog',
        'response-adapt': 'profileResponseAdapt',
        'server-ssl': 'clientTLS',
        'subscriber-mgmt': 'profileSubscriberManagement',
        'tcp-analytics': 'profileAnalyticsTcp',
        'web-acceleration': 'profileHTTPAcceleration',
        analytics: 'profileAnalytics',
        apm: 'policyEndpoint',
        asm: 'policyWAF',
        classification: 'profileClassification',
        dns: 'profileDNS',
        dos: 'profileDOS',
        fastl4: 'profileL4',
        fix: 'profileFIX',
        ftp: 'profileFTP',
        html: 'profileHTML',
        http: 'profileHTTP',
        http2: 'profileHTTP2',
        httprouter: 'httpMrfRoutingEnabled',
        icap: 'profileICAP',
        ipother: 'profileIPOther',
        ntlm: 'profileNTLM',
        radius: 'profileRADIUS',
        rewrite: 'profileRewrite',
        sctp: 'profileSCTP',
        sip: 'profileSIP',
        spm: 'profileEnforcement',
        stream: 'profileStream',
        tcp: 'profileTCP',
        udp: 'profileUDP'
    };

    profs.forEach((prof) => {
        const profType = getObjectType(prof, file);
        const profDict = serviceProfileProperties[profType];
        if (profDict) {
            if (profDict === 'clientTLS' || profDict === 'serverTLS') {
                if (!service[profDict]) service[profDict] = [];
                if (!getObjectType(prof, '')) {
                    service[profDict].push({ bigip: handleSharedPath(prof) });
                } else {
                    service[profDict].push(handleObjectRef(prof));
                }
            } else if (profDict === 'profileTCP' || profDict === 'profileHTTP2') {
                if (!service[profDict]) service[profDict] = {};
                if (obj[prof].context === 'clientside') {
                    service[profDict].ingress = handleObjectRef(prof);
                } else if (obj[prof].context === 'serverside') {
                    service[profDict].egress = handleObjectRef(prof);
                } else {
                    service[profDict] = handleObjectRef(prof);
                }
            } else {
                service[profDict] = handleObjectRef(prof);
            }
        } else {
            log.warn(`Invalid reference dropped: ${prof}`);
        }
    });

    // make clean up for ssl profiles
    ['clientTLS', 'serverTLS'].forEach((prof) => {
        if (Object.keys(service).includes(prof) && service[prof].length === 1) {
            const tmp = service[prof][0];

            // if profile is not default and not in /Common/, use just name
            if (getObjectType(tmp.bigip, '')) {
                service[prof] = tmp;
            } else if (tmp.bigip.startsWith('/Common/')) {
                service[prof] = handleSharedPath(tmp.bigip);
            } else {
                service[prof] = tmp.bigip.split('/').pop();
            }

        // if we have multiple profiles, all of them should be just in /Common
        } else if (Object.keys(service).includes(prof) && service[prof].length > 1) {
            const tmp = service[prof];
            for (let i = 0; i < tmp.length; i += 1) {
                // Clean up duplicate profiles here
                if ((tmp[i].bigip || tmp[i].use).match(/[_.-]\d+-{0,1}$/ig)) {
                    tmp.splice(i, 1);
                    i -= 1;
                }
                tmp[i] = { bigip: `/Common/${path.basename(tmp[i].bigip || tmp[i].use)}` };
            }
            // Check if we still have multiple profiles
            service[prof] = (tmp.length === 1) ? handleSharedPath(tmp[0].bigip) : tmp;
        }
    });
    return service;
};

module.exports = {

    // Service
    'ltm virtual': {
        class: 'UNCERTAIN_SERVICE',

        keyValueRemaps: {
            autoLasthop: (key, val) => ({ lastHop: enabledToEnable(val) }),

            clonePools: (key, val) => {
                const obj = {};
                Object.keys(val).forEach((x) => {
                    if (val[x].context === 'clientside') obj.ingress = handleObjectRef(x);
                    if (val[x].context === 'serverside') obj.egress = handleObjectRef(x);
                });
                return { clonePools: obj };
            },

            fallbackPersistenceMethod: (key, val) => ({ fallbackPersistenceMethod: handleObjectRef(val) }),

            mirroring: (key, val) => returnEmptyObjIfNone(val, { mirroring: 'L4' }),

            policyFirewallEnforced: (key, val) => ({ policyFirewallEnforced: handleObjectRef(val) }),

            policyFirewallStaged: (key, val) => ({ policyFirewallStaged: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc, file) => {
            const newObj = {};
            const orig = file[loc.original];

            // fix for un-prefixed profiles on /Common 16.1
            rootObj.profiles = Object.assign(...Object.keys(rootObj.profiles).map((prof) => {
                const newKey = !prof.includes('/') ? `/Common/${prof}` : prof;
                return { [newKey]: rootObj.profiles[prof] };
            }));

            // set Service class and template (plus any refs in properties)
            const serviceType = getServiceType(rootObj.profiles, file);
            if (loc.profile === 'serviceMain') {
                newObj.template = serviceType.template;
            }
            delete serviceType.template;
            rootObj = Object.assign(rootObj, serviceType);

            // add redirect80
            if (rootObj.class === 'Service_HTTPS') {
                rootObj.redirect80 = false;
            }

            // ipForward
            if (rootObj.ipForward === '' || rootObj.l2Forward === '') {
                rootObj.class = 'Service_Forwarding';
                if (rootObj.ipForward === '') {
                    rootObj.forwardingType = 'ip';
                    delete rootObj.ipForward;
                }
                if (rootObj.l2Forward === '') {
                    rootObj.forwardingType = 'l2';
                    delete rootObj.l2Forward;
                }
            }

            // handle pool ref
            if (rootObj.pool) {
                const poolSplit = rootObj.pool.split('/');
                if ((loc.app === 'Shared' && poolSplit.length === 3) || (poolSplit[1] === loc.tenant && poolSplit[2] === loc.app)) {
                    rootObj.pool = poolSplit.at(-1);
                } else {
                    rootObj.pool = handleSharedPath(rootObj.pool);
                }
            }

            // internal virtual server
            if (rootObj.internal !== undefined) {
                rootObj.class = 'Service_TCP';
                rootObj.sourceAddress = rootObj.source;
                rootObj.virtualType = 'internal';
                delete rootObj.internal;
                delete rootObj.source;
                delete rootObj.vlansEnabled;
                delete rootObj.destination;
            }

            // parse virtualAddresses and virtualPort
            if (rootObj.destination) {
                let split = rootObj.destination.split(':');
                const ipv6 = split.length > 2;
                if (ipv6) split = rootObj.destination.split('.');
                const addrSplit = split[0].split('/');
                let addr = addrSplit.at(-1);
                if (addr && !isIPv4(addr) && !isIPv6(addr)) {
                    addr = handleObjectRef(split[0]);
                }

                rootObj.virtualAddresses = [addr];
                rootObj.virtualPort = portDict[split[1]] || parseInt(split[1], 10);
                delete rootObj.destination;
            }

            // calculate netmask for 'destination'
            if (rootObj.mask && rootObj.mask !== '255.255.255.255' && rootObj.virtualType !== 'internal') {
                const cidr = getCidrFromNetmask(rootObj.mask);
                rootObj.virtualAddresses = rootObj.virtualAddresses.map((x) => ((typeof x === 'string') ? `${x}${cidr}` : x));
            }
            delete rootObj.mask;

            // 'traffic-matching-criteria' -> virtualAddresses/virtualPort (v14.1)
            const tmc = orig['traffic-matching-criteria'];
            if (tmc) {
                const ref = `ltm traffic-matching-criteria ${tmc}`;

                const addrList = file[ref]['destination-address-list'];
                if (addrList) {
                    rootObj.virtualAddresses = Object.keys(file[`net address-list ${addrList}`].addresses);
                } else if (file[ref]['destination-address-inline']) {
                    const address = file[ref]['destination-address-inline'];
                    rootObj.virtualAddresses = Array.isArray(address) ? address : [address];
                }

                const portList = file[ref]['destination-port-list'];
                if (portList) {
                    rootObj.virtualPort = Object.keys(file[`net port-list ${portList}`].ports).map((x) => parseInt(x, 10));
                } else if (file[ref]['destination-port-inline']) {
                    rootObj.virtualPort = parseInt(file[ref]['destination-port-inline'], 10);
                }
            }

            // handle 'source'
            if (rootObj.source && rootObj.source !== '0.0.0.0/0') {
                rootObj.virtualAddresses = rootObj.virtualAddresses.map((x) => [x, rootObj.source]);
            }
            delete rootObj.source;

            // used with client/server side of http2 profile
            if (rootObj.httpMrfRoutingEnabled) {
                rootObj.httpMrfRoutingEnabled = true;
            }

            // handle irules refs
            if (rootObj.iRules) {
                rootObj.iRules = Object.keys(rootObj.iRules)
                    .map((x) => handleObjectRef(x));
            }

            // handle persist ref
            if (rootObj.class !== 'Service_Forwarding') {
                if (rootObj.persistenceMethods) {
                    const arr = [];
                    Object.keys(rootObj.persistenceMethods).forEach((x) => {
                        x = !x.includes('/') ? `/Common/${x}` : x;
                        x = handleObjectRef(x);
                        if (x.bigip) {
                            x = x.bigip.replace('source_addr', 'source-address')
                                .replace('dest_addr', 'destination-address')
                                .split('/')[2];
                        }
                        arr.push(x);
                    });
                    rootObj.persistenceMethods = arr;
                } else {
                    rootObj.persistenceMethods = [];
                }
            }

            // remap snat
            rootObj.snat = rootObj.type;
            if (rootObj.snat === 'automap') rootObj.snat = 'auto';
            if (rootObj.snat === 'snat') rootObj.snat = 'self';
            if (!rootObj.snat) rootObj.snat = 'none';
            if (rootObj.snat === 'lsn') delete rootObj.snat;
            else if (rootObj.snatPool) rootObj.snat = handleObjectRef(rootObj.snatPool);

            delete rootObj.snatPool;
            delete rootObj.type;

            // handle allowVlans and rejectVlans
            if (Object.keys(rootObj).includes('vlansEnabled')) {
                rootObj.allowVlans = Object.keys(rootObj.vlans || {}).map((x) => ({ bigip: x }));
            } else if (rootObj.vlans) {
                rootObj.rejectVlans = Object.keys(rootObj.vlans).map((x) => ({ bigip: x }));
            }
            delete rootObj.vlansEnabled;
            delete rootObj.vlansDisabled;
            delete rootObj.vlans;

            // service_l4 specific props
            if (rootObj.class === 'Service_L4' && !rootObj.layer4) {
                rootObj.layer4 = 'any';
            }

            // policyNAT
            const natPolicy = orig['security-nat-policy'];
            if (natPolicy) {
                rootObj.policyNAT = handleObjectRef(natPolicy.policy);
            }

            // policyEndpoint
            if (rootObj.policies) {
                rootObj.policyEndpoint = handleSharedPath(Object.keys(rootObj.policies)[0]);
                delete rootObj.policies;
            }

            // policyBandwidthControl
            const bwcPolicy = orig['bwc-policy'];
            if (bwcPolicy) {
                rootObj.policyBandwidthControl = handleObjectRef(bwcPolicy);
            }

            // policyIdleTimeout
            if (rootObj.servicePolicy) {
                const listOfKeys = Object.keys(file);
                const ref = file[listOfKeys.find((elem) => elem.includes(rootObj.servicePolicy))];
                rootObj.policyIdleTimeout = handleObjectRef(ref['timer-policy']);
                delete rootObj.servicePolicy;
            }

            // securityLogProfiles
            if (rootObj.securityLogProfiles) {
                rootObj.securityLogProfiles = Object.keys(rootObj.securityLogProfiles)
                    .map((x) => handleObjectRef(x));
            }

            // Cleanup indirect service refs
            delete rootObj.bwcPolicy;
            delete rootObj.policy;
            delete rootObj.profiles;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // used when rootObj has 'traffic-matching-criteria' property
    'ltm traffic-matching-criteria': {
        noDirectMap: true
    },

    // used when recursing ltm virtual
    'ltm virtual source-address-translation': {
        class: 'PHANTOM_SNAT',

        // rename pool so it does not overwrite 'ltm virtual' pool name
        keyValueRemaps: {
            pool: (key, val) => ({ snatPool: val })
        }
    }
};
