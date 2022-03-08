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

const assert = require('assert');
const doConverter = require('../../../../src/engines/doConverter');
const parse = require('../../../../src/engines/parser');
const readFiles = require('../../../../src/preConverter/readFiles');
const validator = require('../../validators/doAdapter');

const ex1 = require('./managementipfirewall.json');

let declaration;

describe('ManagementIpFirewall: sys management-ip', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/doConverter/managementipfirewall/managementipfirewall.conf']);
        const parsed = parse(data);
        declaration = doConverter(parsed);
        assert.deepStrictEqual(ex1, declaration);
    });

    it('ex1 validation', () => validator(declaration)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
