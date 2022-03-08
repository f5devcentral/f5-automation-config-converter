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

const ex1 = require('./service_tcp.json');
const ex2 = require('./service_tcp2.json');
const ex3 = require('./service_tcp3.json');
const ex4 = require('./service_tcp4.json');
const ex5 = require('./service_tcp5.json');
const ex6 = require('./service_tcp6.json');
const ex7 = require('./service_tcp7.json');
const ex8 = require('./service_tcp8.json');
const ex9 = require('./service_tcp9.json');

let json;

describe('Service TCP: ltm virtual', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_tcp/service_tcp.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_tcp/service_tcp2.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex2.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex3', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_tcp/service_tcp3.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex3.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex3 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Support creation of internal VS
    it('ex4', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_tcp/service_tcp4.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex4.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex4 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Support ability to create ICAP profile added in AS3.16
    it('ex5', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_tcp/service_tcp5.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex5.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex5 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Fix merge cases for virtuals
    it('ex6', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_tcp/service_tcp6.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex6.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex6 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Add support text ports
    it('ex7', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_tcp/service_tcp7.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex7.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex7 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // translateClientPort
    it('ex8', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_tcp/service_tcp8.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex8.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex8 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // remove empty Common
    it('ex9', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_tcp/service_tcp9.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex9.Test_partition;
        const convertedDec = json.Test_partition;
        compareDeclaration(originalDec, convertedDec);
        assert(typeof (json.Common) === 'undefined', '\'Common\' should be removed from AS3');
    });

    it('ex9 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
