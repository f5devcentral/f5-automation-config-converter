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

const doConverter = require('../../../../src/engines/doConverter');
const validator = require('../../validators/doAdapter');

const ex1 = require('./devicecertificate.json');

let declaration;

describe('DeviceCertificate: server.key and server.crt', () => {
    // get certificate and key
    it('ex1', async () => {
        const data = {};
        const testCert = fs.readFileSync('./test/engines/doConverter/devicecertificate/devicecertificate.crt', 'utf-8');
        data['var/tmp/cert_temp/conf/ssl.crt/server.crt'] = testCert;
        data['var/tmp/cert_temp/conf/ssl.key/server.key'] = process.env.TEST_KEY;

        declaration = doConverter(data);

        const originalDec = ex1;
        originalDec.Common.deviceCertificate.privateKey.base64 = Buffer.from(process.env.TEST_KEY).toString('base64');
        assert.deepStrictEqual(originalDec, declaration);
    });

    it('ex1 validation', () => validator(declaration)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
