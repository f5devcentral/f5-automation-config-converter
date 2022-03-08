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

const ex1 = require('./tls_server.json');
const ex2 = require('./tls_server2.json');
const ex3 = require('./tls_server3.json');
const ex4 = require('./tls_server4.json');
const ex5 = require('./tls_server5.json');
const ex6 = require('./tls_server6.json');
const ex7 = require('./tls_server7.json');
const ex8 = require('./tls_server8.json');
const ex9 = require('./tls_server9.json');
const ex10 = require('./tls_server10.json');
const ex11 = require('./tls_server11.json');

const normalizeCert = (str) => str.replace(/\n/g, '');

const serviceHttpsAllowlist = ['certificate', 'chainCA', 'passphrase'];

let json;

describe('TLS_Server: ltm profile client-ssl', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server.conf']);

        const chain = fs.readFileSync('./test/engines/as3Converter/tls_server/tls_server-bundle.crt', 'utf-8');
        const cert = fs.readFileSync('./test/engines/as3Converter/tls_server/tls_server.crt', 'utf-8');
        const key = process.env.TEST_KEY;

        const tlsCert = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantApplication1tlsservercert.crt_122995_1';
        const tlsKey = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_key_d/AS3_TenantApplication1tlsservercert.key_122997_1';
        const webcert = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantApplication2webcert1.crt_123003_1';
        const webcertKey = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_key_d/AS3_TenantApplication2webcert1.key_123005_1';
        const webcert2Bundle = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantApplication2webcert2-bundle.crt_123009_1';
        const webcert2 = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantApplication2webcert2.crt_123007_1';
        const webcert2Key = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_key_d/AS3_TenantApplication2webcert2.key_123011_1';
        data[tlsCert] = cert;
        data[tlsKey] = key;
        data[webcert] = cert;
        data[webcertKey] = key;
        data[webcert2Bundle] = chain;
        data[webcert2] = cert;
        data[webcert2Key] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        // TLS_Server
        let originalTlsDec = ex1.AS3_Tenant.Application1.testItem1;
        let convertedTlsDec = json.AS3_Tenant.Application1.testItem1;
        compareDeclaration(originalTlsDec, convertedTlsDec);

        originalTlsDec = ex1.AS3_Tenant.Application2.testItem2;
        convertedTlsDec = json.AS3_Tenant.Application2.testItem2;
        compareDeclaration(originalTlsDec, convertedTlsDec);

        // Certificate
        let originalCertDec = ex1.AS3_Tenant.Application1.tlsservercert;
        originalCertDec.privateKey = process.env.TEST_KEY;
        let convertedCertDec = json.AS3_Tenant.Application1.tlsservercert;
        assert.strictEqual(normalizeCert(originalCertDec.certificate), normalizeCert(convertedCertDec.certificate));
        assert.strictEqual(normalizeCert(originalCertDec.privateKey), normalizeCert(convertedCertDec.privateKey));

        originalCertDec = ex1.AS3_Tenant.Application2.webcert1;
        originalCertDec.privateKey = process.env.TEST_KEY;
        convertedCertDec = json.AS3_Tenant.Application2.webcert1;
        assert.strictEqual(normalizeCert(originalCertDec.certificate), normalizeCert(convertedCertDec.certificate));
        assert.strictEqual(normalizeCert(originalCertDec.privateKey), normalizeCert(convertedCertDec.privateKey));

        originalCertDec = ex1.AS3_Tenant.Application2.webcert2;
        originalCertDec.privateKey = process.env.TEST_KEY;
        convertedCertDec = json.AS3_Tenant.Application2.webcert2;
        assert.strictEqual(normalizeCert(originalCertDec.certificate), normalizeCert(convertedCertDec.certificate));
        assert.strictEqual(normalizeCert(originalCertDec.privateKey), normalizeCert(convertedCertDec.privateKey));
        assert.strictEqual(normalizeCert(originalCertDec.chainCA), normalizeCert(convertedCertDec.chainCA));
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server2.conf']);

        const cert = fs.readFileSync('./test/engines/as3Converter/tls_server/tls_server2.crt', 'utf-8');
        const key = process.env.TEST_KEY;

        const theCert = '/var/tmp/filestore_temp/files_d/Common_d/certificate_d/CommonSharedshared_cert.crt_60262_1';
        const theKey = '/var/tmp/filestore_temp/files_d/Common_d/certificate_key_d/CommonSharedshared_cert.key_60259_1';
        data[theCert] = cert;
        data[theKey] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalTlsDec = ex2.Common.Shared.f5demo_san;
        const convertedTlsDec = json.Common.Shared.f5demo_san;
        compareDeclaration(originalTlsDec, convertedTlsDec);

        const originalCertDec = ex2.Common.Shared.shared_cert;
        const convertedCertDec = json.Common.Shared.shared_cert;
        originalCertDec.privateKey = process.env.TEST_KEY;
        assert.strictEqual(normalizeCert(originalCertDec.certificate), normalizeCert(convertedCertDec.certificate));
        assert.strictEqual(normalizeCert(originalCertDec.privateKey), normalizeCert(convertedCertDec.privateKey));
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check default certificate
    it('ex3', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server3.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex3.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex3 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Support for enabling TLS v1.3
    it('ex4', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server4.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex4.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex4 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check support cache timeout
    it('ex5', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server5.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex5.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex5 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check support for multiple certificates in TLS_Server
    it('ex6', async () => {
        const webcert1Bundle = '/var/tmp/filestore_temp/files_d/Common_d/certificate_d/CommonSharedwebcert1-bundle.crt_342246_1';
        const webcert1 = '/var/tmp/filestore_temp/files_d/Common_d/certificate_d/CommonSharedwebcert1.crt_342244_1';
        const webcert1Key = '/var/tmp/filestore_temp/files_d/Common_d/certificate_key_d/CommonSharedwebcert1.key_342248_1';
        const webcert2Bundle = '/var/tmp/filestore_temp/files_d/Common_d/certificate_d/CommonSharedwebcert2-bundle.crt_342252_1';
        const webcert2 = '/var/tmp/filestore_temp/files_d/Common_d/certificate_d/CommonSharedwebcert2.crt_342250_1';
        const webcert2Key = '/var/tmp/filestore_temp/files_d/Common_d/certificate_key_d/CommonSharedwebcert2.key_342254_1';

        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server6.conf']);
        const chain = fs.readFileSync('./test/engines/as3Converter/tls_server/tls_server6-bundle.crt', 'utf-8');
        const cert = fs.readFileSync('./test/engines/as3Converter/tls_server/tls_server6.crt', 'utf-8');
        const key = process.env.TEST_KEY;
        data[webcert1] = cert;
        data[webcert1Key] = key;
        data[webcert1Bundle] = chain;
        data[webcert2] = cert;
        data[webcert2Key] = key;
        data[webcert2Bundle] = chain;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;
        const originalDec = ex6.Common.Shared;
        ex6.Common.Shared.webcert1.privateKey = process.env.TEST_KEY;
        ex6.Common.Shared.webcert2.privateKey = process.env.TEST_KEY;
        const convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec, serviceHttpsAllowlist);
    });

    it('ex6 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check cert reference for certs in /Common/
    it('ex7', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server7.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex7.Common.Shared;
        const convertedDec = json.Common.Shared;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex7 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex8', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server8.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex8;
        const convertedDec = json;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex8 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex9', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server9.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex9;
        const convertedDec = json;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex9 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex10', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server10.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex10;
        const convertedDec = json;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex10 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // remove proxyCaCert, proxyCaKey and proxyCaPassphrase
    it('ex11', async () => {
        const data = await readFiles(['./test/engines/as3Converter/tls_server/tls_server11.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex11;
        const convertedDec = json;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex11 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
