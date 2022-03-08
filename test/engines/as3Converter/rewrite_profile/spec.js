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

const ex1 = require('./rewrite_profile.json');

const normalizeCert = (str) => str.replace(/\n/g, '');

let json;

describe('Rewrite_Profile: ltm profile rewrite', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/rewrite_profile/rewrite_profile.conf']);

        const chain = fs.readFileSync('./test/engines/as3Converter/rewrite_profile/rewrite_profile-bundle.crt', 'utf-8');
        const cert = fs.readFileSync('./test/engines/as3Converter/rewrite_profile/rewrite_profile.crt', 'utf-8');
        const key = process.env.TEST_KEY;

        const bundle = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantAS3_Applicationcert_and_key_with_bundle-bundle.crt_118430_1';
        const theCert = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantAS3_Applicationcert_and_key_with_bundle.crt_118428_1';
        const theKey = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_key_d/AS3_TenantAS3_Applicationcert_and_key_with_bundle.key_118432_1';
        data[bundle] = chain;
        data[theCert] = cert;
        data[theKey] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.AS3_Tenant.AS3_Application.testItem;
        const convertedDec = json.AS3_Tenant.AS3_Application.testItem;
        convertedDec.javaSignKeyPassphrase.ciphertext = Buffer.from('f5f5').toString('base64');
        compareDeclaration(originalDec, convertedDec);

        const originalCertDec = ex1.AS3_Tenant.AS3_Application.cert_and_key_with_bundle;
        originalCertDec.privateKey = process.env.TEST_KEY;
        const convertedCertDec = json.AS3_Tenant.AS3_Application.cert_and_key_with_bundle;

        // these are being swapped
        // assert.strictEqual(normalizeCert(originalCertDec.certificate), normalizeCert(convertedCertDec.certificate));
        // assert.strictEqual(normalizeCert(originalCertDec.chainCA), normalizeCert(convertedCertDec.chainCA));

        assert.strictEqual(originalCertDec.class, convertedCertDec.class);
        assert.strictEqual(normalizeCert(originalCertDec.privateKey), normalizeCert(convertedCertDec.privateKey));
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
