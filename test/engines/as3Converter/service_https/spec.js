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
const fs = require('fs');

const compareDeclaration = require('../compareDeclaration');
const as3Converter = require('../../../../src/engines/as3Converter');
const parse = require('../../../../src/engines/parser');
const readFiles = require('../../../../src/preConverter/readFiles');
const validator = require('../../validators/as3Adapter');

const ex1 = require('./service_https.json');
const ex2 = require('./service_https2.json');
const ex3 = require('./service_https3.json');
const ex4 = require('./service_https4.json');
const ex5 = require('./service_https5.json');
const ex6 = require('./service_https6.json');
const ex7 = require('./service_https7.json');
const ex8 = require('./service_https8.json');
const ex9 = require('./service_https9.json');
const ex10 = require('./service_https10.json');
const ex11 = require('./service_https11.json');
const ex12 = require('./service_https12.json');
const ex13 = require('./service_https13.json');
const ex14 = require('./service_https14.json');
const ex15 = require('./service_https15.json');

const serviceHttpsAllowlist = ['certificate', 'chainCA', 'passphrase'];

const webcert = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantAS3_Applicationwebcert.crt_66614_1';
const webcertChain = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantAS3_Applicationwebcert.crt_66612_1';
const webcertKey = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_key_d/AS3_TenantAS3_Applicationwebcert.key_66616_1';

let json;

describe('Service HTTPS: ltm virtual', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https.conf']);
        const cert = fs.readFileSync('./test/engines/as3Converter/service_https/service_https.crt', 'utf-8');
        const key = process.env.TEST_KEY;
        data[webcert] = cert;
        data[webcertKey] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.AS3_Tenant.AS3_Application;
        originalDec.webcert.privateKey = process.env.TEST_KEY;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, serviceHttpsAllowlist);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https2.conf']);
        const cert = fs.readFileSync('./test/engines/as3Converter/service_https/service_https2.crt', 'utf-8');
        const key = process.env.TEST_KEY;
        data[webcert] = cert;
        data[webcertKey] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex2.AS3_Tenant.AS3_Application;
        originalDec.webcert.privateKey = process.env.TEST_KEY;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, serviceHttpsAllowlist);
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex3', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https3.conf']);
        const chain = fs.readFileSync('./test/engines/as3Converter/service_https/service_https3-bundle.crt', 'utf-8');
        const cert = fs.readFileSync('./test/engines/as3Converter/service_https/service_https3.crt', 'utf-8');
        const key = process.env.TEST_KEY;

        data[webcert] = cert;
        data[webcertChain] = chain;
        data[webcertKey] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex3.AS3_Tenant.AS3_Application;
        originalDec.webcert.privateKey = process.env.TEST_KEY;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, serviceHttpsAllowlist);
    });

    it('ex3 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Added http2 profile
    it('ex4', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https4.conf']);
        const cert = fs.readFileSync('./test/engines/as3Converter/service_https/service_https4.crt', 'utf-8');
        const key = process.env.TEST_KEY;
        data[webcert] = cert;
        data[webcertKey] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex4.AS3_Tenant.AS3_Application;
        originalDec.webcert.privateKey = process.env.TEST_KEY;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, serviceHttpsAllowlist);
    });

    it('ex4 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // multiple client/server ssl profiles. No nightly tests due to limited support in AS3
    it('ex5', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https5.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex5.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex5 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // add support redirect80 for https services
    it('ex6', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https6.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex6.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex6 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // fix ssl profile reference for default profiles. No nightly tests due to limited support in AS3
    it('ex7', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https7.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex7.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex7 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Added default ssl profiles
    it('ex8', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https8.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex8.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex8 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // merge TLS profiles duplicates
    it('ex9', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https9.conf']);

        const chain = fs.readFileSync('./test/engines/as3Converter/service_https/service_https9-bundle.crt', 'utf-8');
        const cert = fs.readFileSync('./test/engines/as3Converter/service_https/service_https9.crt', 'utf-8');
        const key = process.env.TEST_KEY;
        const webcert1Bundle = '/var/tmp/filestore_temp/files_d/Common_d/certificate_d/CommonSharedwebcert1-bundle.crt_342246_1';
        const webcert1 = '/var/tmp/filestore_temp/files_d/Common_d/certificate_d/CommonSharedwebcert1.crt_342244_1';
        const webcert1Key = '/var/tmp/filestore_temp/files_d/Common_d/certificate_key_d/CommonSharedwebcert1.key_342248_1';
        const webcert2Bundle = '/var/tmp/filestore_temp/files_d/Common_d/certificate_d/CommonSharedwebcert2-bundle.crt_342252_1';
        const webcert2 = '/var/tmp/filestore_temp/files_d/Common_d/certificate_d/CommonSharedwebcert2.crt_342250_1';
        const webcert2Key = '/var/tmp/filestore_temp/files_d/Common_d/certificate_key_d/CommonSharedwebcert2.key_342254_1';
        data[webcert1Bundle] = chain;
        data[webcert1] = cert;
        data[webcert1Key] = key;
        data[webcert2Bundle] = chain;
        data[webcert2] = cert;
        data[webcert2Key] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex9.Common.Shared;
        originalDec.webcert1.privateKey = process.env.TEST_KEY;
        originalDec.webcert2.privateKey = process.env.TEST_KEY;
        const convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec, serviceHttpsAllowlist);
    });

    it('ex9 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Added number remarks and profile/virtual similar names
    it('ex10', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https10.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex10.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex10 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Added support client/server side of http2 profile
    it('ex11', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https11.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex11.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex11 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex12', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https12.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex12.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex12 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex13', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https13.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        let originalDec = ex13.AS3_Tenant.AS3_Application;
        let convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
        originalDec = ex13.Common.Shared;
        convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex13 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // allowVlans and rejectVlans
    it('ex14', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https14.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex14.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex14 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // bad reference and special names
    it('ex15', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_https/service_https15.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex15.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex15 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
