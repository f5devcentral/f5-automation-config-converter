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

const compareDeclaration = require('../compareDeclaration');
const as3Converter = require('../../../../src/engines/as3Converter');
const parse = require('../../../../src/engines/parser');
const readFiles = require('../../../../src/preConverter/readFiles');
const validator = require('../../validators/as3Adapter');

const ex1 = require('./service_l4.json');
const ex2 = require('./service_l4.2.json');
const ex3 = require('./service_l4.3.json');

let json;

describe('Service L4: ltm virtual', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_l4/service_l4.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const o = ex1.AS3_Tenant;
        const c = json.AS3_Tenant;
        compareDeclaration(o.testapp1, c.testapp1, []);
        compareDeclaration(o.testapp2, c.testapp2, []);
        compareDeclaration(o.testapp3, c.testapp3, []);
        compareDeclaration(o.testapp4, c.testapp4, []);
        compareDeclaration(o.testapp5, c.testapp5, []);
        compareDeclaration(o.testapp6, c.testapp6, []);
        compareDeclaration(o.testapp7, c.testapp7, []);
        compareDeclaration(o.testapp8, c.testapp8, []);
        compareDeclaration(o.testapp9, c.testapp9, []);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_l4/service_l4.2.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const o = ex2.AS3_Tenant;
        const c = json.AS3_Tenant;
        compareDeclaration(o.AS3_Application, c.AS3_Application, []);
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check traffic-matching-criteria
    it('ex3', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_l4/service_l4.3.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex3.Common.Shared;
        const convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex3 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
