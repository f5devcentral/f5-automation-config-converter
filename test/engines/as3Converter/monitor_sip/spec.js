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
const fs = require('fs');

const compareDeclaration = require('../compareDeclaration');
const as3Converter = require('../../../../src/engines/as3Converter');
const parse = require('../../../../src/engines/parser');
const readFiles = require('../../../../src/preConverter/readFiles');
const validator = require('../../validators/as3Adapter');

const normalizeCert = (str) => str.replace(/\n/g, '');

const ex1 = require('./monitor_sip.json');

const monitorSipAllowlist = ['certificate', 'passphrase'];

let json;

describe('Monitor SIP: ltm monitor sip', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/monitor_sip/monitor_sip.conf']);

        const cert = fs.readFileSync('./test/engines/as3Converter/monitor_sip/monitor_sip.crt', 'utf-8');
        const key = process.env.TEST_KEY;
        const theCert = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenantAS3_Applicationsip_monitor_certificate.crt_209522_1';
        const theKey = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_key_d/AS3_TenantAS3_Applicationsip_monitor_certificate.key_209524_1';
        data[theCert] = cert;
        data[theKey] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.AS3_Tenant.AS3_Application;
        originalDec.sip_monitor_certificate.privateKey = process.env.TEST_KEY;
        const convertedDec = json.AS3_Tenant.AS3_Application;

        assert.strictEqual(
            normalizeCert(convertedDec.sip_monitor_certificate.certificate),
            normalizeCert(originalDec.sip_monitor_certificate.certificate)
        );
        assert.strictEqual(
            normalizeCert(convertedDec.sip_monitor_certificate.privateKey),
            normalizeCert(originalDec.sip_monitor_certificate.privateKey)
        );
        compareDeclaration(originalDec, convertedDec, monitorSipAllowlist);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
