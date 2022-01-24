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

module.exports = function getCidrFromNetmask(netmask, noSlash) {
    if (netmask === 'any') {
        return noSlash ? '0' : '/0';
    }
    let cidr = 0;
    const maskNodes = netmask.match(/(\d+)/g);
    maskNodes.forEach((m) => {
        // eslint-disable-next-line no-bitwise
        cidr += (((m >>> 0).toString(2)).match(/1/g) || []).length;
    });
    return noSlash ? cidr : `/${cidr}`;
};
