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

const util = require('./util');

// test if string is an f5 IP, which means valid IPv4 or IPv6
// with optional %route-domain and/or /mask-length appended.
const IPv4rex = /^(((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)[.]){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d))(%(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{3}|[1-9]\d{2}|[1-9]?\d))?(\x2f(3[012]|2\d|1\d|\d))?$/;

const IPv6rex = /^(::(([0-9a-f]{1,4}:){0,5}((([0-9a-f]{1,4}:)?[0-9a-f]{1,4})|(((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)[.]){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d))))?)|([0-9a-f]{1,4}::(([0-9a-f]{1,4}:){0,4}((([0-9a-f]{1,4}:)?[0-9a-f]{1,4})|(((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)[.]){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d))))?)|([0-9a-f]{1,4}:[0-9a-f]{1,4}::(([0-9a-f]{1,4}:){0,3}((([0-9a-f]{1,4}:)?[0-9a-f]{1,4})|(((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)[.]){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d))))?)|([0-9a-f]{1,4}(:[0-9a-f]{1,4}){2}::(([0-9a-f]{1,4}:){0,2}((([0-9a-f]{1,4}:)?[0-9a-f]{1,4})|(((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)[.]){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d))))?)|([0-9a-f]{1,4}(:[0-9a-f]{1,4}){3}::(([0-9a-f]{1,4}:)?((([0-9a-f]{1,4}:)?[0-9a-f]{1,4})|(((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)[.]){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d))))?)|([0-9a-f]{1,4}(:[0-9a-f]{1,4}){4}::((([0-9a-f]{1,4}:)?[0-9a-f]{1,4})|(((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)[.]){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)))?)|([0-9a-f]{1,4}(:[0-9a-f]{1,4}){5}::([0-9a-f]{1,4})?)|([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,6}::)|(([0-9a-f]{1,4}:){7}[0-9a-f]{1,4})(%(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{3}|[1-9]\d{2}|[1-9]?\d))?(\x2f(12[0-8]|1[01]\d|[1-9]?\d))?$/;

/**
 * Common functionality for IP address checking
 *
 * @private
 */
const isIPCommon = function (address, regex) {
    if (!address) return false;
    if (typeof address !== 'string') return false;

    const lowerAddress = address.toLowerCase();
    if (lowerAddress.match(/[^0-9a-f:.%\x2f]/) !== null) return false;

    return regex.test(lowerAddress);
};

/**
 * Checks if an address is IPv4
 *
 * @public
 * @param {string} address
 * @returns {boolean}
 */
const isIPv4 = function (address) {
    return isIPCommon(address, IPv4rex);
};

/**
 * Checks if an address is IPv6
 *
 * @public
 * @param {string} address
 * @returns {boolean}
 */
const isIPv6 = function (address) {
    return isIPCommon(address, IPv6rex);
};

/**
 * Splits an IPv4 or IPv6 address into an address and port pair
 *
 * @public
 * @param {string} combined
 * @returns {Array}
 */
const splitAddress = function (combined) {
    if (!(combined.indexOf('.') >= 0 && combined.indexOf(':') >= 0)) {
        return [combined, undefined];
    }
    const port = combined.match(/[.:]?[0-9]+$/)[0];
    const address = combined.replace(port, '');
    return [address, port.slice(1)];
};

const getCidrFromNetmask = function (netmask, noSlash) {
    if (netmask === 'any' || netmask === 'any6') {
        return noSlash ? '0' : '/0';
    }
    let cidr = 0;

    if (netmask.includes(':')) {
        const converted = [];
        // convert Ipv6 hex to decimal
        netmask.split(':').forEach((chunk) => {
            const hexInt = parseInt(chunk, 16);
            converted.push(hexInt >> 8); // eslint-disable-line no-bitwise
            converted.push(hexInt & 0xff); // eslint-disable-line no-bitwise
        });

        netmask = converted.join('.');
    }
    const maskNodes = netmask.match(/(\d+)/g);
    maskNodes.forEach((m) => {
        // eslint-disable-next-line no-bitwise
        cidr += (((m >>> 0).toString(2)).match(/1/g) || []).length;
    });
    return noSlash ? cidr : `/${cidr}`;
};

const calcIPv4Netmask = function (maskLength) {
    if (typeof maskLength === 'undefined' || maskLength === '') {
        maskLength = 32;
    }
    maskLength = (maskLength > 32) ? 32 : maskLength;
    maskLength = (maskLength < 0) ? 0 : maskLength;
    const mask = [];
    for (let i = 0; i < 4; i += 1) {
        const n = Math.min(maskLength, 8);
        mask.push(256 - Math.pow(2, 8 - n)); // eslint-disable-line no-restricted-properties
        maskLength -= n;
    }
    return mask.join('.');
};

const calcIPv6Netmask = function (maskLength) {
    if (typeof maskLength === 'undefined' || maskLength === '') {
        maskLength = 128;
    }
    maskLength = (maskLength > 128) ? 128 : maskLength;
    maskLength = (maskLength < 0) ? 0 : maskLength;
    const mask = [];
    for (let i = 0; i < 8; i += 1) {
        const n = Math.min(maskLength, 16);
        const decimal = (65536 - Math.pow(2, 16 - n)); // eslint-disable-line no-restricted-properties
        mask.push(decimal.toString(16));
        maskLength -= n;
    }
    return util.minimizeIP(mask.join(':'));
};

const calcNetmask = function (maskLength, ip) {
    // check for wildcard
    if (maskLength === '0') {
        return (!ip.includes(':')) ? 'any' : 'any6';
    }

    if (typeof ip !== 'undefined' && ip.includes(':')) {
        return calcIPv6Netmask(maskLength);
    }
    return calcIPv4Netmask(maskLength);
};

const parseIpAddress = function (address) {
    if (address === 'any') {
        address = '0.0.0.0';
    }
    address = util.minimizeIP(address) || '';
    const parsedIp = address.match(/([a-zA-Z0-9.:]+)(%(\d+))?(\/(\d+))?/) || [];

    // IPv6 f5 wildcard should be '::' but the above match will give it ':'
    const ip = (parsedIp[1] === ':') ? '::' : parsedIp[1] || '';
    // if parsedIp[3] is '' we want routeDomain set to ''
    const routeDomain = (typeof parsedIp[3] === 'undefined' || parsedIp[3] === '0') ? '' : `%${parsedIp[3]}`;
    // for f5 wildcard cidr should be 0, otherwise take the indicated value
    const cidr = (ip === '0.0.0.0' || ip === '::') ? '0' : parsedIp[5] || '';
    const netmask = calcNetmask(cidr, ip);
    const ipWithRoute = `${ip}${routeDomain}`;

    return {
        ip,
        routeDomain,
        cidr,
        netmask,
        ipWithRoute
    };
};

module.exports = {
    isIPv4,
    isIPv6,
    splitAddress,
    getCidrFromNetmask,
    parseIpAddress,
    calcNetmask
};
