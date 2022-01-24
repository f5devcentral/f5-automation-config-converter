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

const ex1 = require('./tcp_profile.json');
const ex2 = require('./tcp_profile2.json');
const ex3 = require('./tcp_profile3.json');
const ex4 = require('./tcp_profile4.json');

let json;

describe('TCP_Profile: ltm profile tcp', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tcp_profile/tcp_profile.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tcp_profile/tcp_profile2.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;
        compareDeclaration(ex2.Common.Shared, json.Common.Shared);
        compareDeclaration(ex2.AS3_Tenant.AS3_Application, json.AS3_Tenant.AS3_Application);
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex3', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tcp_profile/tcp_profile3.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex3.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex3 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex4', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tcp_profile/tcp_profile4.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;
        compareDeclaration(ex4.Common.Shared, json.Common.Shared);
        assert(!json.Common.Shared.testProfile.md5SignaturePassphrase);
    });

    it('ex4 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
