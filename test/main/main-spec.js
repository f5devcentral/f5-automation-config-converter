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
const { unlink } = require('fs').promises;
const compareDeclaration = require('../engines/as3Converter/compareDeclaration');
const { main, mainAPI } = require('../../src/main');

const ex = require('./main.json');

describe('Test main function (main.js)', () => {
    afterEach(() => {
        unlink('output.json').catch();
        unlink('recognized.json').catch();
        unlink('supported.json').catch();
        unlink('unsupported.json').catch();
    });

    it('Should not fail if bad or encrypted ucs provided', async () => {
        const config = {
            ucs: './test/main/encrypted.ucs',
            output: 'output.json',
            disableAnalytics: true
        };
        assert.doesNotReject(await main(null, config));
        assert(fs.existsSync('output.json'));
    });

    it('Should create logObjects when configured', async () => {
        assert(!fs.existsSync('recognized.json'));
        assert(!fs.existsSync('supported.json'));
        assert(!fs.existsSync('unsupported.json'));

        const config = {
            conf: './test/main/main.conf',
            output: 'output.json',
            disableAnalytics: true,
            debug: true,
            summary: true,
            recognized: true,
            recognizedObjects: 'recognized.json',
            supported: true,
            supportedObjects: 'supported.json',
            unsupported: true,
            unsupportedObjects: 'unsupported.json'
        };

        await main(null, config);

        assert(fs.existsSync('recognized.json'));
        assert(fs.existsSync('supported.json'));
        assert(fs.existsSync('unsupported.json'));
    });

    it('Should be callable from 3rd party script as function, metadata test', async () => {
        const data = fs.readFileSync('./test/main/main.conf', 'utf-8');

        const exMetadata = {
            recognized: {
                'ltm pool /AS3_Tenant/AS3_Application/web_pool': {
                    'min-active-members': '1'
                },
                'ltm virtual /AS3_Tenant/AS3_Application/serviceMain': {
                    description: 'AS3_Application',
                    destination: '/AS3_Tenant/10.0.1.10:80',
                    'ip-protocol': 'tcp',
                    mask: '255.255.255.255',
                    persist: {
                        '/Common/cookie': {
                            default: 'yes'
                        }
                    },
                    pool: '/AS3_Tenant/AS3_Application/web_pool',
                    profiles: {
                        '/Common/f5-tcp-progressive': {}, '/Common/http': {}
                    },
                    source: '0.0.0.0/0',
                    'source-address-translation': {
                        type: 'automap'
                    },
                    'translate-address': 'enabled',
                    'translate-port': 'enabled'
                },
                'ltm virtual-address /AS3_Tenant/10.0.1.10': {
                    address: '10.0.1.10',
                    arp: 'enabled',
                    'inherited-traffic-group': 'true',
                    mask: '255.255.255.255',
                    'traffic-group': '/Common/traffic-group-1'
                }
            },
            declarationInfo: {
                classes: { Pool: 1, Service_HTTP: 1 },
                maps: {
                    applications: ['/AS3_Tenant/AS3_Application'],
                    objects: ['/AS3_Tenant/AS3_Application/web_pool',
                        '/AS3_Tenant/AS3_Application/serviceMain'],
                    tenants: ['/AS3_Tenant']
                },
                total: 2
            },
            supported: {
                'ltm pool /AS3_Tenant/AS3_Application/web_pool': {
                    'min-active-members': '1'
                },
                'ltm virtual /AS3_Tenant/AS3_Application/serviceMain': {
                    description: 'AS3_Application',
                    destination: '/AS3_Tenant/10.0.1.10:80',
                    'ip-protocol': 'tcp',
                    mask: '255.255.255.255',
                    persist: {
                        '/Common/cookie': {
                            default: 'yes'
                        }
                    },
                    pool: '/AS3_Tenant/AS3_Application/web_pool',
                    profiles: {
                        '/Common/f5-tcp-progressive': {}, '/Common/http': {}
                    },
                    source: '0.0.0.0/0',
                    'source-address-translation': {
                        type: 'automap'
                    },
                    'translate-address': 'enabled',
                    'translate-port': 'enabled'
                },
                'ltm virtual-address /AS3_Tenant/10.0.1.10': {
                    address: '10.0.1.10',
                    arp: 'enabled',
                    'inherited-traffic-group': 'true',
                    mask: '255.255.255.255',
                    'traffic-group': '/Common/traffic-group-1'
                }
            },
            unSupported: {}
        };
        const json = await mainAPI(data);
        const convertedMetadata = json.metaData;
        assert.deepStrictEqual(exMetadata, convertedMetadata);
    });

    it('Should be callable from 3rd party script as function, declaration test', async () => {
        const data = fs.readFileSync('./test/main/main.conf', 'utf-8');
        const json = await mainAPI(data);
        const originalDec = ex.AS3_Tenant.AS3_Application;
        const convertedDec = json.declaration.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec, []);
    });
});
