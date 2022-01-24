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
const unquote = require('../../../util/convert/unquote');

const splitRate = (str) => {
    let i;
    for (i = 0; i < str.length; i += 1) {
        const char = str[i];
        if (!/^[0-9]+$/.test(char)) {
            break;
        }
    }

    // identify if unit has a prefix
    return {
        unit: str.slice(i).length === 4 ? `${str[i].toUpperCase()}${str.slice(i + 1)}` : str[i].slice(i),
        value: parseInt(str.slice(0, i), 10)
    };
};

const factorUnits = (int) => {
    if (int % 1000000000 === 0) return { unit: 'Gpps', value: int / 1000000000 };
    if (int % 1000000 === 0) return { unit: 'Mpps', value: int / 1000000 };
    if (int % 1000 === 0) return { unit: 'Kpps', value: int / 1000000 };
    return { unit: 'pps', value: int };
};

module.exports = {

    // Bandwidth_Control_Policy
    'net bwc policy': {
        class: 'Bandwidth_Control_Policy',

        keyValueRemaps: {
            logPublisher: (key, val) => ({ logPublisher: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // categories
            if (rootObj.categories) {
                rootObj.categories = Object.keys(rootObj.categories).map((x) => {
                    const catObj = rootObj.categories[x];
                    const obj = {};

                    if (x !== 'undefined') obj.name = x;
                    if (catObj['ip-tos']) obj.markIP = parseInt(catObj['ip-tos'], 10);
                    if (catObj['link-qos']) obj.markL2 = parseInt(catObj['link-qos'], 10);
                    if (catObj['max-cat-rate-percentage']) {
                        obj.maxBandwidth = parseInt(catObj['max-cat-rate-percentage'], 10);
                        obj.maxBandwidthUnit = '%';
                    } else {
                        obj.maxBandwidth = splitRate(catObj['max-cat-rate']).value;
                        obj.maxBandwidthUnit = splitRate(catObj['max-cat-rate']).unit;
                    }

                    return obj;
                });
            }

            // maxBandwidth
            if (rootObj.maxBandwidth) {
                const maxBand = splitRate(rootObj.maxBandwidth);
                rootObj.maxBandwidth = maxBand.value;
                rootObj.maxBandwidthUnit = maxBand.unit;
            }

            // maxUserBandwidth
            if (rootObj.maxUserBandwidth) {
                const maxBand = splitRate(rootObj.maxUserBandwidth);
                rootObj.maxUserBandwidth = maxBand.value;
                rootObj.maxUserBandwidthUnit = maxBand.unit;
            }

            // maxUserPPS
            if (rootObj.maxUserPPS) {
                const factor = factorUnits(rootObj.maxUserPPS);
                rootObj.maxUserPPS = factor.value;
                rootObj.maxUserPPSUnit = factor.unit;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
