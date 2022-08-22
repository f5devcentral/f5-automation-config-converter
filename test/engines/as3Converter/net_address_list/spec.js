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

const compareDeclaration = require('../compareDeclaration');
const as3Converter = require('../../../../src/engines/as3Converter');
const parse = require('../../../../src/engines/parser');
const readFiles = require('../../../../src/preConverter/readFiles');
const validator = require('../../validators/as3Adapter');

const ex1 = require('./net_address_list.json');

let json;

describe('Net_Address_List: net address list', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/net_address_list/net_address_list.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.Common.Shared;
        const convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
