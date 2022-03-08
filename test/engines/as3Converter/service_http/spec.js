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

const ex1 = require('./service_http.json');
const ex2 = require('./service_http2.json');
const ex3 = require('./service_http3.json');
const ex4 = require('./service_http4.json');
const ex5 = require('./service_http5.json');
const ex6 = require('./service_http6.json');
const ex7 = require('./service_http7.json');
const ex8 = require('./service_http8.json');
const ex9 = require('./service_http9.json');
const ex10 = require('./service_http10.json');
const ex11 = require('./service_http11.json');
const ex12 = require('./service_http12.json');
const ex13 = require('./service_http13.json');
const ex14 = require('./service_http14.json');
const ex15 = require('./service_http15.json');
const ex16 = require('./service_http16.json');
const ex17 = require('./service_http17.json');
const ex18 = require('./service_http18.json');
const ex19 = require('./service_http19.json');
const ex20 = require('./service_http20.json');
const ex21 = require('./service_http21.json');
const ex22 = require('./service_http22.json');

let json;

describe('Service HTTP: ltm virtual', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Multiple virtualAddresses
    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http2.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex2.AS3_Tenant_longer_than_48_symbols_qqqqqqqqqqqqqqqqq
            .AS3_Application_longer_than_48_symbols_qqqqqqqqqqqqqqqqq;
        const convertedDec = json.AS3_Tenant_longer_than_48_symbols_qqqqqqqqqqqqqqqqq
            .AS3_Application_longer_than_48_symbols_qqqqqqqqqqqqqqqqq;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Ref to default Persist
    it('ex3', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http3.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex3.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex3 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Ref to custom Persist
    it('ex4', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http4.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex4.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex4 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Ref to custom iRules
    it('ex5', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http5.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex5.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex5 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // All profile refs
    it('ex6', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http6.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex6.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex6 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Snat pool (issue #136) and profileRewrite ref
    it('ex7', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http7.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex7.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex7 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Virtual server names add support '.' and '-'
    it('ex8', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http8.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex8.AS3_Tenant.Shared;
        const convertedDec = json.AS3_Tenant.Shared;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex8 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // "Shared" app always has a template "shared" set(issue #175)
    it('ex9', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http9.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex9.Common.Shared;
        const convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex9 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Test non-default partition
    it('ex10', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http10.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex10;
        const convertedDec = json;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex10 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Test bot-defence profile
    it('ex11', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http11.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex11.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex11 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Test throughput-capacity
    it('ex12', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http12.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex12.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex12 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Test ingress/egress profileTCP
    it('ex13', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http13.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex13.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex13 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Test persistence profile
    it('ex14', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http14.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex14.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex14 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Test httpcompression profile
    it('ex15', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http15.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex15.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex15 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Add "mptcp-mobile-optimized"
    it('ex16', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http16.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex16.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex16 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Add ntlm profile
    it('ex17', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http17.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex17.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex17 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // allowVlans
    it('ex18', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http18.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex18.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex18 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check remarks
    it('ex19', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http19.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex19.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex19 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check remarks
    it('ex20', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http20.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex20;
        const convertedDec = json;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex20 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // references a Service_Address
    it('ex21', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http21.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex21;
        const convertedDec = json;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex21 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex22', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_http/service_http22.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex22;
        const convertedDec = json;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex22 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
