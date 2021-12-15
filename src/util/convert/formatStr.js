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

// input: '/Tenant1/App1/Profile1'
// output: '/Tenant1/App1/Profile1'
// 1) trim to 194 symbols
// 2) replace spaces in the path to _

module.exports = (str) => {
    if (!str) return undefined;

    let newStr = '';

    // pure unquoted path should not be touched
    if (str.startsWith('/')) {
        newStr = str;
    } else if (str.includes('"')) {
        // quoted == with spaces, replace spaces with _
        const split = str.split('"');
        newStr = split[1].replace(/\s/g, '_');
    } else {
        // unquoter with spaces take last element as object path
        const split = str.split(' ');
        newStr = split[split.length - 1];
    }

    // remove preceeding '_'
    newStr = newStr.replace(/(\/)_+(w+)/g, '$1$2');

    // trim length
    newStr = newStr.substring(0, 194);

    return newStr;
};
