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

const assert = require('assert');

const globalAllowlist = ['label', 'remark'];

module.exports = (as3Decl, accDecl, allowlist = []) => {
    // check every prop in as3 declaration against returned declaration (unless allowlisted)
    const keys = Object.keys(as3Decl);
    for (let i = 0; i < keys.length; i += 1) {
        const profName = keys[i];
        const profile = as3Decl[profName];

        const propKeys = Object.keys(profile);
        for (let j = 0; j < propKeys.length; j += 1) {
            const prop = propKeys[j];

            if (typeof profile === 'object' && !globalAllowlist.concat(allowlist).includes(prop)) {
                const value = profile[prop];
                assert.deepStrictEqual(accDecl[profName][prop], value);
            }
        }
    }
};
