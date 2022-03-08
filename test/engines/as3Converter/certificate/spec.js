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

const as3Converter = require('../../../../src/engines/as3Converter');
const parse = require('../../../../src/engines/parser');
const readFiles = require('../../../../src/preConverter/readFiles');
const validator = require('../../validators/as3Adapter');

const ex1 = require('./certificate.json');
const ex2 = require('./certificate2.json');

const normalizeCert = (str) => str.replace(/\n/g, '');

let json;

describe('Certificate: file sys ssl-cert', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/certificate/certificate.conf']);

        const chain = fs.readFileSync('./test/engines/as3Converter/certificate/certificate-bundle.crt', 'utf-8');
        const cert = fs.readFileSync('./test/engines/as3Converter/certificate/certificate.crt', 'utf-8');
        const key = process.env.TEST_KEY;

        const bundle = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantAS3_ApplicationtheCert-bundle.crt_163527_1';
        const theCert = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantAS3_ApplicationtheCert.crt_163525_1';
        const theCertKey = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_key_d/AS3_TenantAS3_ApplicationtheCert.key_163529_1';
        data[bundle] = chain;
        data[theCert] = cert;
        data[theCertKey] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.AS3_Tenant.AS3_Application.theCert;
        originalDec.privateKey = process.env.TEST_KEY;
        const convertedDec = json.AS3_Tenant.AS3_Application.theCert;

        assert.strictEqual(normalizeCert(originalDec.certificate), normalizeCert(convertedDec.certificate));
        assert.strictEqual(normalizeCert(originalDec.chainCA), normalizeCert(convertedDec.chainCA));
        assert.strictEqual(originalDec.class, convertedDec.class);
        assert.strictEqual(originalDec.privateKey, convertedDec.privateKey);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/certificate/certificate2.conf']);
        const cert = fs.readFileSync('./test/engines/as3Converter/certificate/certificate2.crt', 'utf-8');
        const theCert = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantAS3_ApplicationtestItem.crt_129337_1';
        data[theCert] = cert;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex2.AS3_Tenant.AS3_Application.testItem;
        const convertedDec = json.AS3_Tenant.AS3_Application.testItem;
        assert.strictEqual(normalizeCert(originalDec.certificate), normalizeCert(convertedDec.certificate));
        assert.strictEqual(originalDec.class, convertedDec.class);
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
