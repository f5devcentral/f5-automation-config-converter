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

const ex1 = require('./gslb_monitor.json');

const monitorHttpsAllowlist = ['certificate', 'passphrase', 'chainCA'];

let json;

describe('GSLB_Monitor: gtm monitor', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/gslb_monitor/gslb_monitor.conf']);

        const chain = fs.readFileSync('./test/engines/as3Converter/gslb_monitor/gslb_monitor-bundle.crt', 'utf-8');
        const cert = fs.readFileSync('./test/engines/as3Converter/gslb_monitor/gslb_monitor.crt', 'utf-8');
        const key = process.env.TEST_KEY;

        const bundle = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenanthttpsMonitortheCert-bundle.crt_65253_1';
        const theCert = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_d/AS3_TenanthttpsMonitortheCert.crt_65251_1';
        const theCertKey = '/var/tmp/filestore_temp/files_d/AS3_Tenant_d/certificate_key_d/AS3_TenanthttpsMonitortheCert.key_65255_1';
        data[bundle] = chain;
        data[theCert] = cert;
        data[theCertKey] = key;

        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const o = ex1.AS3_Tenant;
        o.httpsMonitor.theCert.privateKey = process.env.TEST_KEY;
        const c = json.AS3_Tenant;
        compareDeclaration(o.httpMonitor, c.httpMonitor, []);
        compareDeclaration(o.httpsMonitor, c.httpsMonitor, monitorHttpsAllowlist);
        compareDeclaration(o.icmpMonitor, c.icmpMonitor, []);
        compareDeclaration(o.tcpMonitor, c.tcpMonitor, []);
        compareDeclaration(o.udpMonitor, c.udpMonitor, []);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
