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

const log = require('../util/log');

const idx = (p, o) => p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

function removeInvalidRefs(obj, origObj) {
    Object.keys(obj)
        .filter((k) => typeof obj[k] === 'object' && obj[k].class)
        .forEach((key) => {
            const declaration = origObj || obj;
            if (obj[key].class === 'Tenant' || obj[key].class === 'Application') {
                return removeInvalidRefs(obj[key], declaration);
            }
            return deleteRef(obj[key], declaration, key);
        });
    return obj;
}

const getRefdObj = (item, origObj) => {
    const ref = item.use;
    const refSplit = ref.split('/');
    refSplit.shift();
    return idx(refSplit, origObj);
};

const countSlashes = (str) => (str.match(/\//g) || []).length;

function deleteRef(obj, origObj, objName) {
    Object.keys(obj)
        .filter((key) => obj[key])
        .forEach((key) => {
            if (Array.isArray(obj[key])) {
                // array of wrapped refs
                for (let i = 0; i < obj[key].length; i += 1) {
                    if (!obj[key][i].use) return;
                    const refdObj = getRefdObj(obj[key][i], origObj);
                    if (!refdObj) {
                        // remove item from array
                        log.warn(`Invalid reference removed: ${objName}.${key}: ${JSON.stringify(obj[key][i])}`);
                        obj[key].splice(i, 1);
                        i -= 1;
                    }
                }
                if (obj[key].length === 0) delete obj[key];
            } else if (obj[key].use) {
                const refdObj = getRefdObj(obj[key], origObj);
                if (!refdObj) {
                    // wrapped ref
                    log.warn(`Invalid reference removed: ${objName}.${key}: ${JSON.stringify(obj[key])}`);
                    delete obj[key];
                }
            } else if (typeof obj[key] === 'string' && obj[key].startsWith('/') && countSlashes(obj[key]) === 3) {
                const refdObj = getRefdObj({ use: obj[key] }, origObj);
                if (!refdObj) {
                    // string ref
                    log.warn(`Invalid reference removed: ${objName}.${key}: ${obj[key]}`);
                    delete obj[key];
                }
            }
        });
}

module.exports = removeInvalidRefs;
