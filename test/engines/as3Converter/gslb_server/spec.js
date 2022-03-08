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

const ex1 = require('./gslb_server.json');
const ex2 = require('./gslb_server2.json');

let json;

describe('GSLB_Server: gtm server', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/gslb_server/gslb_server.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.Common.Shared;
        const convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Test virtual name
    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/gslb_server/gslb_server2.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex2.Common.Shared;
        const convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
