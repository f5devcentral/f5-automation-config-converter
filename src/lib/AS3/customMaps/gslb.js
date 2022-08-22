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
const isIPv4 = require('../../../util/convert/isIPv4');
const returnEmptyObjIfNone = require('../../../util/convert/returnEmptyObjIfNone');
const unquote = require('../../../util/convert/unquote');

module.exports = {

    // GSLB Monitor External
    'gtm monitor external': {
        class: 'GSLB_Monitor',

        lookupOverride: 'gtm monitor',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'external';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB Monitor HTTP
    'gtm monitor http': {
        class: 'GSLB_Monitor',

        lookupOverride: 'gtm monitor',

        keyValueRemaps: {
            send: (key, val) => ({ send: unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'http';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB Monitor HTTPS
    'gtm monitor https': {
        class: 'GSLB_Monitor',

        lookupOverride: 'gtm monitor',

        keyValueRemaps: {
            clientCertificate: (key, val) => ({ clientCertificate: val.replace('.crt', '') }),

            receive: (key, val) => returnEmptyObjIfNone(val, { receive: unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            send: (key, val) => ({ send: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'https';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB Monitor Gateway-ICMP
    'gtm monitor gateway-icmp': {
        class: 'GSLB_Monitor',

        lookupOverride: 'gtm monitor',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'gateway-icmp';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB Monitor TCP
    'gtm monitor tcp': {
        class: 'GSLB_Monitor',

        lookupOverride: 'gtm monitor',

        keyValueRemaps: {
            send: (key, val) => ({ send: unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'tcp';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB Monitor UDP
    'gtm monitor udp': {
        class: 'GSLB_Monitor',

        lookupOverride: 'gtm monitor',

        keyValueRemaps: {
            send: (key, val) => ({ send: unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'udp';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Data_Center
    'gtm datacenter': {
        class: 'GSLB_Data_Center',

        keyValueRemaps: {
            metadata: () => ({}),

            proberPool: (key, val) => ({ proberPool: handleObjectRef(unquote(val)) }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // GSLB_Prober_Pool
    'gtm prober-pool': {
        class: 'GSLB_Prober_Pool',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // members
            if (rootObj.members) {
                rootObj.members = Object.keys(rootObj.members).map((x) => {
                    const memb = rootObj.members[x];
                    return {
                        memberOrder: parseInt(memb.order, 10),
                        server: { use: x }
                    };
                });
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_iRule; the same as iRule
    'gtm rule': {
        class: 'GSLB_iRule',

        customHandling: (rootObj, loc, file) => {
            const newObj = {};
            let irule = file[loc.original];
            irule = irule.replace(/\/Common/g, '/Common/Shared');
            rootObj.iRule = { base64: Buffer.from(irule).toString('base64') };
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Server
    'gtm server': {
        class: 'GSLB_Server',

        keyValueRemaps: {
            dataCenter: (key, val) => ({ dataCenter: handleObjectRef(val) }),

            metadata: () => ({})
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // devices
            if (rootObj.devices) {
                rootObj.devices = Object.keys(rootObj.devices).map((x) => {
                    const addr = Object.keys(rootObj.devices[x].addresses);
                    return { address: addr[0] };
                });
            }

            // virtualServers
            if (rootObj.virtualServers) {
                rootObj.virtualServers = Object.keys(rootObj.virtualServers).map((x) => {
                    const name = x;
                    const dest = rootObj.virtualServers[x].destination;
                    const spltr = isIPv4(dest) ? ':' : '.';
                    const addr = dest.split(spltr)[0];
                    const prt = parseInt(dest.split(spltr)[1], 10);
                    if (name.match(/^\d+$/g)) return { address: addr, port: prt };
                    return { address: addr, port: prt, name };
                });
            }

            // monitors
            if (rootObj.monitors === '/Common/bigip') {
                rootObj.monitors = rootObj.monitors.split(' ').map((x) => handleObjectRef(x));
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Topology_Region
    'gtm region': {
        class: 'GSLB_Topology_Region',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const newMembers = [];

            if (rootObj.members) {
                Object.keys(rootObj.members).forEach((member) => {
                    const words = member.split(' ');
                    let matchOperator = 'equals';
                    if (words.length >= 3 && words[0] === 'not') {
                        matchOperator = 'not-equals';
                        words.shift();
                    }
                    if (words.length >= 2) {
                        const newMember = {};
                        let matchValue = '';
                        newMember.matchType = words[0];
                        newMember.matchOperator = matchOperator;
                        matchValue = unquote(words.slice(1, words.length).join(' '));
                        if (newMember.matchType === 'isp' && matchValue.includes('/')) {
                            matchValue = matchValue.substring(matchValue.lastIndexOf('/') + 1);
                        }
                        newMember.matchValue = matchValue;
                        newMembers.push(newMember);
                    }
                });
                rootObj.members = newMembers;
            }
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Topology_Records
    'gtm topology': {
        class: 'GSLB_Topology_Records',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const newRecords = [];

            if (rootObj.records) {
                Object.keys(rootObj.records).forEach((topology) => {
                    let newRecord = {};
                    let newSource = {};
                    let newDestination = {};
                    let newWeight = 1;
                    if (topology === 'longest-match-enabled') {
                        if (rootObj.records[topology] === 'true') {
                            rootObj.longestMatchEnabled = true;
                        } else {
                            rootObj.longestMatchEnabled = false;
                        }
                    } else {
                        ['source', 'destination'].forEach((property) => {
                            let matchOperator = 'equals';
                            let matchType;
                            let matchValue;
                            let sourceOrDestination = rootObj.records[topology][property];
                            if (typeof sourceOrDestination === 'string') {
                                if (sourceOrDestination.startsWith('not')) {
                                    matchOperator = 'not-equals';
                                    sourceOrDestination = sourceOrDestination.slice(4, sourceOrDestination.length);
                                }
                                if (sourceOrDestination.startsWith('continent')) {
                                    matchType = 'continent';
                                    sourceOrDestination = sourceOrDestination.slice(10, sourceOrDestination.length);
                                    matchValue = sourceOrDestination;
                                } else if (sourceOrDestination.startsWith('country')) {
                                    matchType = 'country';
                                    sourceOrDestination = sourceOrDestination.slice(8, sourceOrDestination.length);
                                    matchValue = sourceOrDestination;
                                } else if (sourceOrDestination.startsWith('geoip-isp')) {
                                    matchType = 'geoip-isp';
                                    sourceOrDestination = sourceOrDestination.slice(10, sourceOrDestination.length);
                                    matchValue = sourceOrDestination;
                                } else if (sourceOrDestination.startsWith('isp /Common/')) {
                                    matchType = 'isp';
                                    sourceOrDestination = sourceOrDestination.slice(12, sourceOrDestination.length);
                                    matchValue = sourceOrDestination;
                                } else if (sourceOrDestination.startsWith('state')) {
                                    matchType = 'state';
                                    sourceOrDestination = sourceOrDestination.slice(6, sourceOrDestination.length);
                                    matchValue = unquote(sourceOrDestination);
                                } else if (sourceOrDestination.startsWith('subnet')) {
                                    matchType = 'subnet';
                                    sourceOrDestination = sourceOrDestination.slice(7, sourceOrDestination.length);
                                    matchValue = sourceOrDestination;
                                }
                            }
                            if (property === 'source') {
                                newSource = {
                                    matchType,
                                    matchOperator,
                                    matchValue
                                };
                            } else {
                                newDestination = {
                                    matchType,
                                    matchOperator,
                                    matchValue
                                };
                            }
                        });
                        if (rootObj.records[topology].score) {
                            newWeight = parseInt(rootObj.records[topology].score, 10);
                        }
                        newRecord = {
                            destination: newDestination,
                            source: newSource,
                            weight: newWeight
                        };
                        newRecords.push(newRecord);
                    }
                });
            }
            rootObj.records = newRecords;
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Domain (A)
    'gtm wideip a': {
        class: 'GSLB_Domain',

        keyValueRemaps: {
            aliases: (key, val) => ({ aliases: Object.keys(val).map((x) => x.replace(/\\/g, '')) }),

            iRules: (key, val) => ({ iRules: Object.keys(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.resourceRecordType = 'A';
            rootObj.domainName = loc.original.split('/').pop();

            // lastResortPool
            if (rootObj.lastResortPool) {
                rootObj.lastResortPoolType = rootObj.lastResortPool.split(' ')[0].toUpperCase();
                rootObj.lastResortPool = handleObjectRef(rootObj.lastResortPool.split(' ')[1]);
            }

            // pools
            if (rootObj.pools) {
                rootObj.pools = Object.keys(rootObj.pools).map((x) => handleObjectRef(x));
            }
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Domain (AAAA)
    'gtm wideip aaaa': {
        class: 'GSLB_Domain',

        keyValueRemaps: {
            aliases: (key, val) => ({ aliases: Object.keys(val).map((x) => x.replace(/\\/g, '')) }),

            iRules: (key, val) => ({ iRules: Object.keys(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.resourceRecordType = 'AAAA';
            rootObj.domainName = loc.original.split('/').pop();

            // lastResortPool
            if (rootObj.lastResortPool) {
                rootObj.lastResortPoolType = rootObj.lastResortPool.split(' ')[0].toUpperCase();
                rootObj.lastResortPool = handleObjectRef(rootObj.lastResortPool.split(' ')[1]);
            }

            // pools
            if (rootObj.pools) {
                rootObj.pools = Object.keys(rootObj.pools).map((x) => handleObjectRef(x));
            }
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Domain (CNAME)
    'gtm wideip cname': {
        class: 'GSLB_Domain',

        keyValueRemaps: {
            aliases: (key, val) => ({ aliases: Object.keys(val).map((x) => x.replace(/\\/g, '')) }),

            iRules: (key, val) => ({ iRules: Object.keys(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.resourceRecordType = 'CNAME';
            rootObj.domainName = loc.original.split('/').pop();

            // lastResortPool
            if (rootObj.lastResortPool) {
                rootObj.lastResortPoolType = rootObj.lastResortPool.split(' ')[0].toUpperCase();
                rootObj.lastResortPool = handleObjectRef(rootObj.lastResortPool.split(' ')[1]);
            }

            // pools
            if (rootObj.pools) {
                rootObj.pools = Object.keys(rootObj.pools).map((x) => handleObjectRef(x));
            }
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Domain (MX)
    'gtm wideip mx': {
        class: 'GSLB_Domain',

        keyValueRemaps: {
            aliases: (key, val) => ({ aliases: Object.keys(val).map((x) => x.replace(/\\/g, '')) }),

            iRules: (key, val) => ({ iRules: Object.keys(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.resourceRecordType = 'MX';
            rootObj.domainName = loc.original.split('/').pop();

            // lastResortPool
            if (rootObj.lastResortPool) {
                rootObj.lastResortPoolType = rootObj.lastResortPool.split(' ')[0].toUpperCase();
                rootObj.lastResortPool = handleObjectRef(rootObj.lastResortPool.split(' ')[1]);
            }

            // pools
            if (rootObj.pools) {
                rootObj.pools = Object.keys(rootObj.pools).map((x) => handleObjectRef(x));
            }
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Pool (A)
    'gtm pool a': {
        class: 'GSLB_Pool',

        lookupOverride: 'gtm pool',

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const rootKeys = Object.keys(rootObj);
            rootObj.resourceRecordType = 'A';

            // members
            if (rootObj.members) {
                rootObj.members = Object.keys(rootObj.members).map((x) => {
                    const keySplit = x.split(':');
                    const member = rootObj.members[x];

                    // domain
                    if (keySplit.length !== 2) {
                        if (Object.keys(member).includes('static-target')) {
                            return {
                                domainName: keySplit[0],
                                isDomainNameStatic: member['static-target'] === 'yes',
                                ratio: parseInt(member.ratio, 10)
                            };
                        }

                        return {
                            domainName: handleObjectRef(`/Common/${x}`),
                            priority: parseInt(member.priority, 10),
                            ratio: parseInt(member.ratio, 10)
                        };
                    }

                    return {
                        ratio: parseInt(member.ratio, 10),
                        server: handleObjectRef(keySplit[0]),
                        virtualServer: keySplit[1]
                    };
                });
            }

            // enabled
            if (rootKeys.includes('disabled')) {
                rootObj.enabled = false;
            }

            // monitors
            if (rootObj.monitors) {
                rootObj.monitors = rootObj.monitors.split(' and ').map((x) => handleObjectRef(x));
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Pool (AAAA)
    'gtm pool aaaa': {
        class: 'GSLB_Pool',

        lookupOverride: 'gtm pool',

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const rootKeys = Object.keys(rootObj);
            rootObj.resourceRecordType = 'AAAA';

            // members
            if (rootObj.members) {
                rootObj.members = Object.keys(rootObj.members).map((x) => {
                    const keySplit = x.split(':');
                    const member = rootObj.members[x];

                    // domain
                    if (keySplit.length !== 2) {
                        if (Object.keys(member).includes('static-target')) {
                            return {
                                domainName: keySplit[0],
                                isDomainNameStatic: member['static-target'] === 'yes',
                                ratio: parseInt(member.ratio, 10)
                            };
                        }

                        return {
                            domainName: handleObjectRef(`/Common/${x}`),
                            priority: parseInt(member.priority, 10),
                            ratio: parseInt(member.ratio, 10)
                        };
                    }

                    return {
                        ratio: parseInt(member.ratio, 10),
                        server: handleObjectRef(keySplit[0]),
                        virtualServer: keySplit[1]
                    };
                });
            }

            // enabled
            if (rootKeys.includes('disabled')) {
                rootObj.enabled = false;
                delete rootObj.disabled;
            }

            // monitors
            if (rootObj.monitors) {
                rootObj.monitors = rootObj.monitors.split(' and ').map((x) => handleObjectRef(x));
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Pool (CNAME)
    'gtm pool cname': {
        class: 'GSLB_Pool',

        lookupOverride: 'gtm pool',

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const rootKeys = Object.keys(rootObj);
            rootObj.resourceRecordType = 'CNAME';

            // members
            if (rootObj.members) {
                rootObj.members = Object.keys(rootObj.members).map((x) => {
                    const keySplit = x.split(':');
                    const member = rootObj.members[x];

                    // domain
                    if (keySplit.length !== 2) {
                        if (Object.keys(member).includes('static-target')) {
                            const tmpObj = {
                                domainName: keySplit[0],
                                isDomainNameStatic: member['static-target'] === 'yes',
                                ratio: parseInt(member.ratio, 10)
                            };
                            if (!tmpObj.ratio) delete tmpObj.ratio;
                            return tmpObj;
                        }

                        const tmpObj = {
                            domainName: keySplit[0],
                            ratio: parseInt(member.ratio, 10)
                        };
                        if (!tmpObj.ratio) delete tmpObj.ratio;
                        return tmpObj;
                    }

                    const tmpObj = {
                        ratio: parseInt(member.ratio, 10),
                        server: handleObjectRef(keySplit[0]),
                        virtualServer: keySplit[1]
                    };
                    if (!tmpObj.ratio) delete tmpObj.ratio;
                    return tmpObj;
                });
            }

            // enabled
            if (rootKeys.includes('disabled')) {
                rootObj.enabled = false;
                delete rootObj.disabled;
            }

            // monitors
            if (rootObj.monitors) {
                rootObj.monitors = rootObj.monitors.split(' and ').map((x) => handleObjectRef(x));
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // GSLB_Pool (MX)
    'gtm pool mx': {
        class: 'GSLB_Pool',

        lookupOverride: 'gtm pool',

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const rootKeys = Object.keys(rootObj);
            rootObj.resourceRecordType = 'MX';

            // members
            if (rootObj.members) {
                rootObj.members = Object.keys(rootObj.members).map((x) => {
                    const keySplit = x.split(':');
                    const member = rootObj.members[x];

                    // domain
                    if (keySplit.length !== 2) {
                        if (Object.keys(member).includes('static-target')) {
                            return {
                                domainName: keySplit[0],
                                isDomainNameStatic: member['static-target'] === 'yes',
                                ratio: parseInt(member.ratio, 10)
                            };
                        }

                        return {
                            domainName: handleObjectRef(`/Common/${x}`),
                            priority: parseInt(member.priority, 10),
                            ratio: parseInt(member.ratio, 10)
                        };
                    }

                    return {
                        ratio: parseInt(member.ratio, 10),
                        server: handleObjectRef(keySplit[0]),
                        virtualServer: keySplit[1]
                    };
                });
            }

            // enabled
            if (rootKeys.includes('disabled')) {
                rootObj.enabled = false;
                delete rootObj.disabled;
            }

            // monitors
            if (rootObj.monitors) {
                rootObj.monitors = rootObj.monitors.split(' and ').map((x) => handleObjectRef(x));
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
