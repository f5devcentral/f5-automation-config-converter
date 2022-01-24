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

const customDict = require('./customDict');

// Profile-specific key/value overrides:
// return both key and value
// to remove prop entirely, return empty object
module.exports = (key, value, confKey) => {
    // use custom dict if prop is present
    const customClass = customDict[confKey];
    if (customClass && customClass.keyValueRemaps && customClass.keyValueRemaps[key]) {
        return customClass.keyValueRemaps[key](key, value);
    }

    // return unchanged key and value
    const obj = {};
    obj[key] = value;
    return obj;
};
