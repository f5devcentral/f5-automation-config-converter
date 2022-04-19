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

    it('Should be callable from 3rd party script as function, metadata test', async () => {
        const data = fs.readFileSync('./test/main/main.conf', 'utf-8');

        const exMetadata = {
            as3Recognized: {
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
            jsonCount: 3,
            as3Converted: {
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
            as3NotConverted: {},
            unsupportedStats: {}
        };
        const json = await mainAPI(data);
        const convertedMetadata = json.metadata;
        assert.deepStrictEqual(exMetadata, convertedMetadata);
    });

    it('Should be callable from 3rd party script as function, declaration test', async () => {
        const data = fs.readFileSync('./test/main/main.conf', 'utf-8');
        const json = await mainAPI(data);
        const originalDec = ex.AS3_Tenant.AS3_Application;
        const convertedDec = json.declaration.AS3_Tenant.AS3_Application;
        compareDeclaration(originalDec, convertedDec);
    });
});
