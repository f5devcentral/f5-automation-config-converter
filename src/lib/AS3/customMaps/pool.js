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

const assert = require('assert');
const handleObjectRef = require('../../../util/convert/handleObjectRef');
const isIPv6 = require('../../../util/convert/isIPv6');
const unquote = require('../../../util/convert/unquote');

// custom diff func w/ concept of allowlist
const customDiff = (obj1, obj2, allowlist) => {
    const obj1Props = Object.keys(obj1);
    for (let i = 0; i < obj1Props.length; i += 1) {
        const prop = obj1Props[i];

        if (!allowlist.includes(prop)) {
            if (typeof obj1[prop] !== 'object' && obj1[prop] !== obj2[prop]) {
                return false;
            }

            // compare arrays of monitors
            if (Array.isArray(obj1[prop])) {
                try {
                    assert.deepStrictEqual(obj1[prop], obj2[prop]);
                } catch (e) {
                    return false;
                }
            }
        }
    }
    return true;
};

const dedupe = (arr, propsToMerge) => {
    const newArr = [];

    // no merge required
    if (arr.length === 1) return arr;

    // merge possibly required
    for (let i = 0; i < arr.length; i += 1) {
        // check if dupe exists
        const originalItem = arr[i];
        let dupe = false;
        let idx = 0;
        for (let j = 0; j < newArr.length; j += 1) {
            const newArrItem = newArr[j];
            const diff = customDiff(originalItem, newArrItem, propsToMerge);
            if (diff) {
                dupe = diff;
                idx = j;
            }
        }

        // if dupe, concat serverAddress and servers
        if (dupe) {
            if (newArr[idx].serverAddresses && arr[i].serverAddresses) {
                newArr[idx].serverAddresses = newArr[idx].serverAddresses.concat(arr[i].serverAddresses);
            } else if (newArr[idx].servers && arr[i].servers) {
                newArr[idx].servers = newArr[idx].servers.concat(arr[i].servers);
            } else if (newArr[idx].serverAddresses) {
                newArr[idx].servers = arr[i].servers;
            } else {
                newArr[idx].serverAddresses = arr[i].serverAddresses;
            }

        // else push entire member
        } else {
            newArr.push(arr[i]);
        }
    }
    return newArr;
};

module.exports = {

    // Pool
    'ltm pool': {
        class: 'Pool',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc, file) => {
            const newObj = {};
            const members = [];

            // find if 'minimumMonitors' or 'monitor' attached to pool
            const origObj = file[loc.original];
            const minMonitor = Object.keys(origObj).filter((x) => x.includes('monitor min'))[0];
            if (origObj.monitor) {
                rootObj.monitors = origObj.monitor.split(' and ').map((m) => handleObjectRef(m));
            } else if (minMonitor) {
                rootObj.minimumMonitors = parseInt(minMonitor.split(' ')[2], 10);
                rootObj.monitors = origObj[minMonitor].map((m) => handleObjectRef(m));
            }

            if (rootObj.members) {
                const keys = Object.keys(rootObj.members);
                for (let i = 0; i < keys.length; i += 1) {
                    const poolMemberPath = keys[i];
                    const poolMember = rootObj.members[poolMemberPath];
                    const memberJson = {};

                    // address discovery
                    memberJson.addressDiscovery = 'static';
                    if (poolMember.fqdn) {
                        memberJson.addressDiscovery = 'fqdn';
                        memberJson.hostname = poolMember.fqdn.name;
                    }

                    // parse ipv4/ipv6 or string with ipv4 port
                    const tmpSplit = poolMemberPath.split('/');
                    const memberNamePort = tmpSplit[tmpSplit.length - 1];
                    const portSpltr = isIPv6(memberNamePort) ? '.' : ':';
                    memberJson.servicePort = parseInt(poolMemberPath.split(portSpltr)[1], 10);

                    // manually map poolMember properties
                    if (poolMember['connection-limit']) memberJson.connectionLimit = parseInt(poolMember['connection-limit'], 10);
                    if (poolMember['rate-limit']) memberJson.rateLimit = parseInt(poolMember['rate-limit'], 10);
                    if (poolMember['dynamic-ratio']) memberJson.dynamicRatio = parseInt(poolMember['dynamic-ratio'], 10);
                    if (poolMember.ratio) memberJson.ratio = parseInt(poolMember.ratio, 10);
                    if (poolMember['priority-group']) memberJson.priorityGroup = parseInt(poolMember['priority-group'], 10);

                    // handle members with directly-attached monitors
                    // parse  'monitor min 1 of': [ '/Common/http' ]
                    const membMinMon = Object.keys(poolMember).filter((x) => x.includes('monitor min'))[0];
                    if (poolMember.monitor) {
                        memberJson.monitors = poolMember.monitor.split(' and ').map((m) => handleObjectRef(m));
                    } else if (membMinMon) {
                        memberJson.minimumMonitors = parseInt(membMinMon.split(' ')[2], 10);
                        memberJson.monitors = poolMember[membMinMon].map((m) => handleObjectRef(m));
                    }

                    if (poolMember.address) {
                        // If pool member name is the same as ip address
                        const poolMemberName = isIPv6(memberNamePort) ? memberNamePort.split('.')[0] : memberNamePort.split(':')[0];
                        if (poolMemberName === poolMember.address) {
                            memberJson.serverAddresses = [poolMember.address];
                        } else {
                            const tmpMember = {
                                name: poolMemberName,
                                address: poolMember.address
                            };
                            memberJson.servers = [tmpMember];
                        }
                        memberJson.shareNodes = true;
                    }
                    members.push(memberJson);
                }
                rootObj.members = dedupe(members, ['serverAddresses', 'servers']);
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
