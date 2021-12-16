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

// <(protected) property> =>
// {ciphertext: 'foo', protected: 'bar', ignoreChanges: true}
module.exports = (val) => {
    const ciphertext = Buffer.from(val).toString('base64');
    const enc = Buffer.from(val).toString().startsWith('$M$') ? 'f5sv' : 'none';
    const alg = Buffer.from(JSON.stringify({ alg: 'dir', enc })).toString('base64');
    return {
        ciphertext,
        protected: alg,
        ignoreChanges: true
    };
};
