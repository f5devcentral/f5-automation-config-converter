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

const ex1 = require('./tls_client.json');
const ex2 = require('./tls_client2.json');
const ex3 = require('./tls_client3.json');
const ex4 = require('./tls_client4.json');
const ex5 = require('./tls_client5.json');
const ex6 = require('./tls_client6.json');
const ex7 = require('./tls_client7.json');
const ex8 = require('./tls_client8.json');

const normalizeCert = (str) => str.replace(/\n/g, '');

let json;

describe('TLS_Client: ltm profile server-ssl', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_client/tls_client.conf']);

        const chain = fs.readFileSync('./test/engines/as3Converter/tls_client/tls_client-bundle.crt', 'utf-8');
        const cert = fs.readFileSync('./test/engines/as3Converter/tls_client/tls_client.crt', 'utf-8');
        const key = process.env.TEST_KEY;
        const theCert = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantAS3_ApplicationtheCert.crt_121202_1';
        const bundle = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantAS3_ApplicationtheCert-bundle.crt_121204_1';
        const theKey = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_key_d/AS3_TenantAS3_ApplicationtheCert.key_121206_1';
        data[theCert] = cert;
        data[bundle] = chain;
        data[theKey] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        // TLS_Client
        const originalTlsDec = ex1.AS3_Tenant.AS3_Application.theTlsClient;
        const convertedTlsDec = json.AS3_Tenant.AS3_Application.theTlsClient;
        compareDeclaration(originalTlsDec, convertedTlsDec, []);

        // Certificate
        // \n varies between original and expected
        const originalCertDec = ex1.AS3_Tenant.AS3_Application.theCert;
        originalCertDec.privateKey = process.env.TEST_KEY;
        const convertedCertDec = json.AS3_Tenant.AS3_Application.theCert;
        assert.strictEqual(normalizeCert(originalCertDec.certificate), normalizeCert(convertedCertDec.certificate));
        assert.strictEqual(normalizeCert(originalCertDec.chainCA), normalizeCert(convertedCertDec.chainCA));
        assert.strictEqual(originalCertDec.class, convertedCertDec.class);
        assert.strictEqual(originalCertDec.privateKey, convertedCertDec.privateKey);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check default certificate
    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_client/tls_client2.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex2.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Support for enabling TLS v1.3
    it('ex3', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_client/tls_client3.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex3.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex3 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check support cache timeout
    it('ex4', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_client/tls_client4.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex4.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex4 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check cert reference for certs in /Common/
    it('ex5', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_client/tls_client5.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex5.Common.Shared;
        const convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex5 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex6', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_client/tls_client6.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex6.Common.Shared;
        const convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex6 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex7', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_client/tls_client7.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex7.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex7 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex8', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_client/tls_client8.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex8.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });

    it('ex8 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
