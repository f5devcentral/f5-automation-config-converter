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

const removeDefaultValuesDO = require('../../src/postConverter/removeDefaultValuesDO');

describe('Extended objects (removeDefaultValuesDO.js)', () => {
    it('should remove default values from DO objects', () => {
        const extended = {
            class: 'DO',
            schemaVersion: '1.0.0',
            Common: {
                class: 'Tenant',
                httpd: {
                    class: 'HTTPD',
                    allow: 'all',
                    authPamIdleTimeout: 1200,
                    maxClients: 10,
                    sslCiphersuite: ['AES128-SHA'],
                    sslProtocol: 'all -SSLv2 -SSLv3 -TLSv1'
                }
            }
        };
        const output = removeDefaultValuesDO(extended);
        const expected = {
            class: 'DO',
            schemaVersion: '1.0.0',
            Common: {
                class: 'Tenant',
                httpd: {
                    class: 'HTTPD',
                    sslCiphersuite: ['AES128-SHA']
                }
            }
        };

        assert.deepStrictEqual(expected, output);
    });

    it('should not fail on none values', () => {
        const extended = {
            schemaVersion: '1.0.0',
            class: 'Device',
            async: true,
            Common: {
                class: 'Tenant',
                test: {
                    class: 'User',
                    shell: 'none',
                    userType: 'regular',
                    partitionAccess: {
                        'all-partitions': {
                            role: 'no-access'
                        }
                    }
                }
            }
        };
        const output = removeDefaultValuesDO(extended);
        const expected = {
            schemaVersion: '1.0.0',
            class: 'Device',
            async: true,
            Common: {
                class: 'Tenant',
                test: {
                    class: 'User',
                    shell: 'none',
                    userType: 'regular',
                    partitionAccess: {
                        'all-partitions': {
                            role: 'no-access'
                        }
                    }
                }
            }
        };

        assert.deepStrictEqual(expected, output);
    });
});
