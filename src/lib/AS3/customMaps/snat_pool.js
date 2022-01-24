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

const unquote = require('../../../util/convert/unquote');

module.exports = {

    // SNAT_Pool
    'ltm snatpool': {
        class: 'SNAT_Pool',

        keyValueRemaps: {
            members: (key, val) => ({
                snatAddresses: Object.keys(val).map((addr) => {
                    const split = addr.split('/');
                    return split[split.length - 1];
                })
            }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // By-product of SNAT_Pool
    'ltm snat-translation': {
        noDirectMap: true
    }
};
