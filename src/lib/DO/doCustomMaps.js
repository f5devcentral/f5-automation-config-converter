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

// DO classes must be listed here for the converter to attempt a conversion
// if namedClass is true, then multiple instances can exist (with their own names)
// the 'properties' option will add to the configItems.json file (avoids upstream changes)
// keyValueRemaps allows both the key and value of a property to be manipulated

const portDict = require('../portDict.json');
const unquote = require('../../util/convert/unquote');

const camelize = (s) => s.replace(/-./g, (x) => x.toUpperCase()[1]);
const recursiveCamelize = (obj) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        newObj[camelize(key)] = typeof obj[key] === 'object' ? recursiveCamelize(obj[key]) : obj[key];
    });
    return newObj;
};

module.exports = {
    Analytics: {},

    ConfigSync: {
        namedClass: true
    },

    DagGlobals: {},

    DbVariables: {},

    DeviceGroup: {
        properties: [
            { id: 'devices', newId: 'members' }
        ],
        namedClass: true,
        keyValueRemaps: {
            autoSync: (val) => ({ autoSync: val === 'enabled' }),
            members: (val) => ({ members: Object.keys(val).map((x) => x.replace('/Common/', '')) })
        },
        customHandling: (rootObj, className, name, currentDevice) => {
            const ind = rootObj.members.indexOf(currentDevice);
            rootObj.owner = (ind !== -1) ? `/Common/${name}/members/${ind}` : `/Common/${name}/members/0`;

            return { [className]: rootObj };
        }
    },

    DeviceTrust: {
        namedClass: true
    },

    DNS: {},

    DNS_Resolver: {
        namedClass: true,
        keyValueRemaps: {
            forwardZones: (val) => ({
                forwardZones: Object.keys(val).map((v) => ({
                    name: v,
                    nameservers: Object.keys(val[v].nameservers).map((x) => x.replace('domain', '53'))
                }))
            }),

            routeDomain: (val) => ({ routeDomain: val.replace('/Common/', '') })
        }
    },

    FailoverMulticast: {
        namedClass: true
    },

    FailoverUnicast: {
        namedClass: true,
        customHandling: (rootObj, className) => {
            if (rootObj.addressPorts) {
                rootObj.addressPorts = Object.keys(rootObj.addressPorts).map((key) => {
                    const tmpObj = rootObj.addressPorts[key];
                    return { address: tmpObj['effective-ip'], port: parseInt(tmpObj['effective-port'], 10) };
                });
            }

            return { [className]: rootObj };
        }
    },

    FirewallAddressList: {
        namedClass: true,
        keyValueRemaps: {
            addresses: (val) => ({ addresses: Object.keys(val) })
        }
    },

    FirewallPolicy: {
        namedClass: true,

        properties: [
            { id: 'rules' }
        ],

        customHandling: (rootObj, className) => {
            const cRoot = recursiveCamelize(rootObj);

            cRoot.rules = Object.keys(cRoot.rules).map((r) => {
                const rule = cRoot.rules[r];

                const newObj = {
                    destination: {},
                    source: {}
                };

                Object.keys(newObj).forEach((i) => {
                    ['addressLists', 'portLists', 'vlans'].forEach((p) => {
                        if (rule[i][p]) {
                            newObj[i][p] = Object.keys(rule[i][p]).map((ref) => `/Common/${ref}`);
                        }
                    });
                });

                return {
                    action: rule.action,
                    destination: newObj.destination,
                    loggingEnabled: rule.log === 'yes',
                    name: r,
                    protocol: rule.ipProtocol,
                    remark: unquote(rule.description),
                    source: newObj.source
                };
            });

            return { [className]: cRoot };
        }
    },

    FirewallPortList: {
        namedClass: true,
        keyValueRemaps: {
            ports: (val) => ({ ports: Object.keys(val) })
        }
    },

    GSLBDataCenter: {
        namedClass: true
    },

    GSLBGlobals: {
        customHandling: (rootObj, className) => {
            const general = {};
            Object.keys(rootObj)
                .filter((k) => k !== 'class')
                .forEach((k) => {
                    general[k] = rootObj[k];
                    delete rootObj[k];
                });
            rootObj.general = general;

            return { [className]: rootObj };
        }
    },

    GSLBProberPool: {
        namedClass: true,
        properties: [
            { id: 'members' }
        ],
        keyValueRemaps: {
            members: (val) => {
                const members = Object.keys(val).map((key) => {
                    const tempObj = {};
                    if (val[key].description) tempObj.remark = unquote(val[key].description);
                    tempObj.server = key;
                    return tempObj;
                });

                return { members };
            }
        }
    },

    GSLBMonitor: {
        namedClass: true,
        properties: [
            { id: 'defaultsFrom' }
        ],
        keyValueRemaps: {
            defaultsFrom: (val) => ({ monitorType: val.split('/').pop().replace('_', '-') })
        }
    },

    GSLBServer: {
        namedClass: true,
        properties: [
            { id: 'devices' }
        ],
        keyValueRemaps: {
            devices: (val) => {
                const devices = Object.keys(val).map((key) => {
                    const tempObj = {};
                    tempObj.address = Object.keys(val[key].addresses)[0];
                    if (val[key].description) tempObj.remark = unquote(val[key].description);
                    tempObj.addressTranslation = val[key].addresses[tempObj.address].translation;
                    return tempObj;
                });

                return { devices };
            },

            monitors: (val) => ({ monitors: val.split('and').map((item) => item.trim()) })
        }
    },

    HTTPD: {
        keyValueRemaps: {
            sslCiphersuite: (val) => ({ sslCiphersuite: val.split(':') })
        }
    },

    License: {},

    ManagementIp: {
        namedClass: true,
        customHandling: (rootObj, className, objName) => {
            rootObj.address = objName;
            return { [className]: rootObj };
        }
    },

    ManagementRoute: {
        namedClass: true
    },

    MirrorIp: {
        namedClass: true
    },

    NTP: {},

    Provision: {},

    RemoteAuthRole: {
        properties: [{ id: 'roleInfo' }],

        reduceTmshPath: true,

        customHandling: (rootObj, className) => {
            // returns multiple DO stanzas from one tmsh object
            const cRoot = recursiveCamelize(rootObj);

            const roles = Object.keys(cRoot.roleInfo).map((r) => {
                if (cRoot.roleInfo[r].lineOrder) {
                    cRoot.roleInfo[r].lineOrder = parseInt(cRoot.roleInfo[r].lineOrder, 10);
                }
                cRoot.roleInfo[r].remoteAccess = !cRoot.roleInfo[r].deny;
                delete cRoot.roleInfo[r].deny;
                cRoot.roleInfo[r].class = className;
                return { [r]: cRoot.roleInfo[r] };
            });
            return Object.assign(...roles);
        }
    },

    Route: {
        namedClass: true
    },

    RouteDomain: {
        namedClass: true,

        keyValueRemaps: {
            vlans: (val) => ({ vlans: Object.keys(val) }),
            routingProtocols: (val) => ({ routingProtocols: Object.keys(val) })
        }
    },

    RouteMap: {
        namedClass: true,

        properties: [
            { id: 'entries' }
        ],

        keyValueRemaps: {
            entries(val) {
                const cVal = recursiveCamelize(val);
                return {
                    entries: Object.keys(cVal).map((key) => {
                        cVal[key].name = key;
                        return cVal[key];
                    })
                };
            }
        }
    },

    RoutingBGP: {
        namedClass: true,

        properties: [
            { id: 'neighbor' },
            { id: 'peerGroup' }
        ],

        keyValueRemaps: {
            addressFamilies(val) {
                const cVal = recursiveCamelize(val);

                const addressFamilies = Object.keys(cVal)
                    .filter((key) => Object.keys(cVal[key]).length > 0)
                    .map((key) => {
                        cVal[key].internetProtocol = key;

                        if (cVal[key].redistribute) {
                            cVal[key].redistributionList = Object.keys(cVal[key].redistribute).map((item) => ({
                                routeMap: cVal[key].redistribute[item].routeMap,
                                routingProtocol: item
                            }));
                            delete cVal[key].redistribute;
                        }

                        return cVal[key];
                    });

                return { addressFamilies };
            },

            gracefulRestart(val) {
                const cVal = recursiveCamelize(val);
                if (cVal.gracefulReset) {
                    cVal.gracefulResetEnabled = cVal.gracefulReset === 'enabled';
                    delete cVal.gracefulReset;

                    if (cVal.restartTime) cVal.restartTime = parseInt(cVal.restartTime, 10);
                    if (cVal.stalepathTime) {
                        cVal.stalePathTime = parseInt(cVal.stalepathTime, 10);
                        delete cVal.stalepathTime;
                    }
                }
                return { gracefulRestart: cVal };
            },

            neighbor(val) {
                const cVal = recursiveCamelize(val);
                const neighbors = Object.keys(cVal).map((key) => ({
                    address: key,
                    ebgpMultihop: parseInt(cVal[key].ebgpMultihop, 10),
                    peerGroup: cVal[key].peerGroup
                }));

                return { neighbors };
            },

            peerGroup(val) {
                const cVal = recursiveCamelize(val);

                const peerGroups = Object.keys(cVal).map((key) => {
                    const addressFamilies = Object.keys(cVal[key].addressFamily)
                        .filter((item) => Object.keys(cVal[key].addressFamily[item]).length > 1)
                        .map((item) => ({
                            internetProtocol: item,
                            routeMap: cVal[key].addressFamily[item].routeMap,
                            softReconfigurationInboundEnabled: cVal[key].addressFamily[item].softReconfigurationInbound === 'enabled'
                        }));

                    return {
                        addressFamilies,
                        name: key,
                        remoteAS: parseInt(cVal[key].remoteAs, 10)
                    };
                });

                return { peerGroups };
            }
        }
    },

    RoutingAccessList: {
        namedClass: true,

        properties: [
            { id: 'entries' }
        ],

        keyValueRemaps: {
            entries(val) {
                const cVal = recursiveCamelize(val);
                const entries = Object.keys(cVal).map((key) => {
                    cVal[key].name = parseInt(key, 10);

                    if (cVal[key].exactMatch) {
                        cVal[key].exactMatchEnabled = cVal[key].exactMatch === 'enabled';
                        delete cVal[key].exactMatch;
                    }

                    return cVal[key];
                });
                return { entries };
            }
        }
    },

    RoutingAsPath: {
        namedClass: true,

        properties: [
            { id: 'entries' }
        ],

        keyValueRemaps: {
            entries(val) {
                const entries = Object.keys(val).map((key) => {
                    val[key].name = parseInt(key, 10);
                    val[key].regex = unquote(val[key].regex);
                    delete val[key].action;

                    return val[key];
                });
                return { entries };
            }
        }
    },

    RoutingPrefixList: {
        namedClass: true,

        properties: [
            { id: 'entries' }
        ],

        keyValueRemaps: {
            entries(val) {
                const cVal = recursiveCamelize(val);
                const entries = Object.keys(cVal).map((key) => {
                    cVal[key].name = parseInt(key, 10);

                    if (cVal[key].prefixLenRange) {
                        cVal[key].prefixLengthRange = cVal[key].prefixLenRange;
                        delete cVal[key].prefixLenRange;
                    }

                    return cVal[key];
                });
                return { entries };
            }
        }
    },

    SelfIp: {
        namedClass: true,

        keyValueRemaps: {
            allowService: (val) => {
                const newObj = { allowService: typeof (val) === 'object' ? Object.keys(val) : val };
                if (newObj.allowService[0] === 'default') return { allowService: 'default' };
                return newObj;
            },
            trafficGroup: (val) => ({ trafficGroup: val.split('/Common/').pop() })
        },

        customHandling: (rootObj, className) => {
            if (rootObj.allowService === undefined) rootObj.allowService = 'none';
            return { [className]: rootObj };
        }
    },

    SnmpAgent: {},

    SnmpCommunity: {
        namedClass: true,

        properties: [
            { id: 'communities' }
        ],

        reduceTmshPath: true,

        customHandling: (rootObj) => {
            // returns multiple DO stanzas from one tmsh object
            if (rootObj.communities) {
                const communities = Object.keys(rootObj.communities).map((s) => {
                    if (s === 'comm-public') return {};
                    rootObj.communities[s].class = rootObj.class;

                    if (rootObj.communities[s]['community-name']) {
                        rootObj.communities[s].name = rootObj.communities[s]['community-name'];
                        delete rootObj.communities[s]['community-name'];
                    }
                    if (rootObj.communities[s]['oid-subset']) {
                        rootObj.communities[s].oid = rootObj.communities[s]['oid-subset'];
                        delete rootObj.communities[s]['oid-subset'];
                    }

                    if (rootObj.communities[s].ipv6) {
                        rootObj.communities[s].ipv6 = rootObj.communities[s].ipv6 === 'enabled';
                    }

                    return { [s]: rootObj.communities[s] };
                });

                return Object.assign(...communities);
            }
            return {};
        }
    },

    SnmpTrapDestination: {
        namedClass: true,

        properties: [
            { id: 'traps' }
        ],

        reduceTmshPath: true,

        customHandling: (rootObj) => {
            if (rootObj.traps) {
                const cRoot = recursiveCamelize(rootObj);
                const traps = Object.keys(cRoot.traps).map((s) => {
                    const trap = cRoot.traps[s];
                    trap.class = rootObj.class;

                    if (trap.authPassword) {
                        trap.authentication = {
                            password: Buffer.from(trap.authPassword).toString('base64'),
                            protocol: trap.authProtocol
                        };
                        delete trap.authPassword;
                        delete trap.authPasswordEncrypted;
                        delete trap.authProtocol;
                    }

                    if (trap.privacyPassword) {
                        trap.privacy = {
                            password: Buffer.from(trap.privacyPassword).toString('base64'),
                            protocol: trap.privacyProtocol
                        };
                        delete trap.privacyPassword;
                        delete trap.privacyPasswordEncrypted;
                        delete trap.privacyProtocol;
                        delete trap.securityLevel;
                    }

                    trap.destination = trap.host;
                    delete trap.host;

                    trap.port = parseInt(trap.port, 10);

                    return { [s]: trap };
                });

                return Object.assign(...traps);
            }
            return {};
        }
    },

    SnmpTrapEvents: {},

    SnmpUser: {
        properties: [
            { id: 'users' }
        ],

        reduceTmshPath: true,

        customHandling: (rootObj, className) => {
            if (rootObj.users) {
                const cRoot = recursiveCamelize(rootObj);
                const users = Object.keys(cRoot.users).map((s) => {
                    const user = cRoot.users[s];
                    const usrObj = { class: className };

                    if (user.access) usrObj.access = user.access;

                    if (user.authPassword) {
                        usrObj.authentication = {
                            password: Buffer.from(user.authPassword).toString('base64'),
                            protocol: user.authProtocol
                        };
                    }

                    if (user.privacyPassword) {
                        usrObj.privacy = {
                            password: Buffer.from(user.privacyPassword).toString('base64'),
                            protocol: user.privacyProtocol
                        };
                    }

                    if (user.oidSubset) usrObj.oid = user.oidSubset;

                    return { [s]: usrObj };
                });

                return Object.assign(...users);
            }
            return {};
        }
    },

    SSHD: {
        keyValueRemaps: {
            banner: (val, conf) => ({ banner: unquote(conf.bannerText) }),

            include: (val) => {
                const newObj = {};
                val.trim().split('\n').forEach((v) => {
                    let strKey = v.split(' ')[0];
                    if (strKey === 'MACs') {
                        strKey = 'MACS';
                    } else {
                        strKey = strKey[0].toLowerCase() + strKey.slice(1);
                    }

                    let strVal = v.split(' ')[1];
                    if (strVal.includes(',')) strVal = strVal.split(',');
                    if (!Array.isArray(strVal) && parseInt(strVal, 10)) {
                        strVal = parseInt(strVal, 10);
                    }
                    newObj[strKey] = strVal;
                });
                return newObj;
            }
        }
    },

    SyslogRemoteServer: {
        customHandling: (rootObj, className) => {
            // returns multiple DO stanzas from one tmsh object
            const cRoot = recursiveCamelize(rootObj);
            const servers = Object.keys(cRoot.remoteServers).map((s) => {
                cRoot.remoteServers[s].class = className;
                if (cRoot.remoteServers[s].remotePort) {
                    cRoot.remoteServers[s].remotePort = portDict[cRoot.remoteServers[s].remotePort];
                }
                return { [s]: cRoot.remoteServers[s] };
            });

            return Object.assign(...servers);
        }
    },

    System: {},

    TrafficControl: {},

    TrafficGroup: {
        namedClass: true,

        keyValueRemaps: {
            haOrder: (val) => ({ haOrder: Object.keys(val) })
        }
    },

    Trunk: {
        namedClass: true,

        keyValueRemaps: {
            interfaces: (val) => ({ interfaces: Object.keys(val) })
        }
    },

    Tunnel: {
        namedClass: true
    },

    // User: custom handling, not in configItems
    User: {},

    VLAN: {
        namedClass: true,
        properties: [
            { id: 'interfaces' }
        ],
        keyValueRemaps: {
            interfaces: (val) => ({
                interfaces: Object.keys(val).map((name) => ({
                    name,
                    tagged: Object.keys(val[name])[0] === 'tagged'
                }))
            })
        }
    }
};
