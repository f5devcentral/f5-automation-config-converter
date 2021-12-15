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

const unquote = require('../../../util/convert/unquote');
const handleObjectRef = require('../../../util/convert/handleObjectRef');

module.exports = {

    // Cipher
    'ltm cipher rule': {
        class: 'Cipher_Rule',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) }),
            dhGroups: (key, val) => ({ namedGroups: val.split(':') }),
            cipher: (key, val) => ({ cipherSuites: val.split(':') }),
            signatureAlgorithms: (key, val) => ({ signatureAlgorithms: val.split(':') })
        }
    },

    // Cipher_Group
    'ltm cipher group': {
        class: 'Cipher_Group',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) }),

            allowCipherRules: (key, val) => ({ allowCipherRules: Object.keys(val).map((x) => handleObjectRef(x)) }),

            excludeCipherRules: (key, val) => ({ excludeCipherRules: Object.keys(val).map((x) => handleObjectRef(x)) }),

            requireCipherRules: (key, val) => ({ requireCipherRules: Object.keys(val).map((x) => handleObjectRef(x)) })
        }
    }
};
