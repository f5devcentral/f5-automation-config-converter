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

const getKey = require('../util/getKey');

// return a new (mirror) object, with only allowlisted props from dict
module.exports = (json, dict) => {
    const newObj = {};
    const rootObjs = Object.keys(json);
    for (let j = 0; j < rootObjs.length; j += 1) {
        const confObj = rootObjs[j];
        if (Object.keys(dict).includes(getKey(confObj))) {
            newObj[confObj] = json[confObj];
        }
    }
    return newObj;
};
