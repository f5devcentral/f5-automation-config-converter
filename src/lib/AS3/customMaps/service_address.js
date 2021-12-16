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

const enabledToEnable = require('../../../util/convert/enabledToEnable');
const getCidrFromNetmask = require('../../../util/convert/getCidrFromNetmask');

module.exports = {

    // Service_Address
    'ltm virtual-address': {
        class: 'Service_Address',

        keyValueRemaps: {
            icmpEcho: (key, val) => ({ icmpEcho: enabledToEnable(val) }),

            routeAdvertisement: (key, val) => ({ routeAdvertisement: enabledToEnable(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // netmask
            if (rootObj.netmask && rootObj.netmask !== '255.255.255.255') {
                const cidr = getCidrFromNetmask(rootObj.netmask);
                rootObj.virtualAddress = `${rootObj.virtualAddress}${cidr}`;
            }
            delete rootObj.netmask;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
