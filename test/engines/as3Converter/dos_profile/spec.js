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

const ex1 = require('./dos_profile.json');
const ex2 = require('./dos_profile2.json');
const ex3 = require('./dos_profile3.json');
const ex4 = require('./dos_profile4.json');
const ex5 = require('./dos_profile5.json');

let json;

describe('DOS_Profile: security dos profile', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/dos_profile/dos_profile.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/dos_profile/dos_profile2.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex2.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex3', async () => {
        const data = await readFiles(['./test/engines/as3Converter/dos_profile/dos_profile3.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex3.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex3 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex4', async () => {
        const data = await readFiles(['./test/engines/as3Converter/dos_profile/dos_profile4.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex4.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex4 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex5', async () => {
        const data = await readFiles(['./test/engines/as3Converter/dos_profile/dos_profile5.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex5.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex5 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
