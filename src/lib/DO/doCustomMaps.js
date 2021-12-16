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

// DO classes must be listed here for the converter to attempt a conversion
// if namedClass is true, then multiple instances can exist (with their own names)
// the 'properties' option will add to the configItems.json file (avoids upstream changes)
// keyValueRemaps allows both the key and value of a property to be manipulated

const unquote = require('../../util/convert/unquote');

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
        customHandling: (rootObj, name, currentDevice) => {
            const ind = rootObj.members.indexOf(currentDevice);
            rootObj.owner = (ind !== -1) ? `/Common/${name}/members/${ind}` : `/Common/${name}/members/0`;
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
        customHandling: (rootObj) => {
            if (rootObj.addressPorts) {
                rootObj.addressPorts = Object.keys(rootObj.addressPorts).map((key) => {
                    const tmpObj = rootObj.addressPorts[key];
                    return { address: tmpObj['effective-ip'], port: parseInt(tmpObj['effective-port'], 10) };
                });
            }
        }
    },

    FirewallAddressList: {
        namedClass: true,
        keyValueRemaps: {
            addresses: (val) => ({ addresses: Object.keys(val) })
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
        customHandling: (rootObj) => {
            const general = {};
            Object.keys(rootObj)
                .filter((k) => k !== 'class')
                .forEach((k) => {
                    general[k] = rootObj[k];
                    delete rootObj[k];
                });
            rootObj.general = general;
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
        customHandling: (rootObj, objName) => {
            rootObj.address = objName;
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

    Route: {
        namedClass: true
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

        customHandling: (rootObj) => {
            if (rootObj.allowService === undefined) rootObj.allowService = 'none';
        }
    },

    SnmpAgent: {},

    SnmpTrapEvents: {},

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
