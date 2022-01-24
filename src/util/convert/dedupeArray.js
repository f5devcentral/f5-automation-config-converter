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

module.exports = (arr) => {
    // separate dedupe steps for strings vs arrays vs objs
    const dict = [];
    arr.forEach((val) => {
        const dictObjs = dict.filter((x) => x.use).map((x) => x.use);
        const dictObjs1 = dict.filter((x) => x.bigip).map((x) => x.bigip);
        if (typeof val === 'string' && !dict.includes(val)) {
            dict.push(val);
        } else if (Array.isArray(val)) {
            // check if current array 'dict' includes array 'val'
            let include = false;
            dict.forEach((dictItem) => {
                if (arrayEquals(val, dictItem)) include = true;
            });
            if (!include) dict.push(val);
        } else if (typeof val === 'object' && !dictObjs.includes(val.use) && !dictObjs1.includes(val.bigip)) {
            dict.push(val);
        }
    });
    return dict;
};

function arrayEquals(a, b) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, i) => val === b[i]);
}
