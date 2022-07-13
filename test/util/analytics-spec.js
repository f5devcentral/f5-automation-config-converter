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

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const assert = chai.assert;

const analytics = require('../../src/lib/analytics');

describe('Test analytics prep (analytics.js)', () => {
    const data = {};
    data['config/bigip_base.conf'] = 'test';
    data['config/bigip.license'] = 'test';

    const results = {
        declaration: {
            schemaVersion: '1.0.0',
            class: 'Device',
            async: true,
            Common: {
                class: 'Tenant',
                test: 'TestDeclaration'
            }
        },
        metadata: {
            as3Recognized: {
                'ltm pool /Common/test': {}
            },
            jsonCount: 1,
            as3ConvertedCount: 1,
            as3Converted: {
                'ltm pool /Common/test': {}
            },
            as3NotConverted: {
                'test test /Common/test': {}
            },
            as3NextNotConverted: 6,
            as3NextNotConvertedKeyCount: { 'security dos': 6 },
            as3NextConverted: 11,
            as3NextConvertedKeyCount: { 'ltm pool': 11 },
            keyNextConverted: ['ltm pool /Common/test']
        }
    };

    it('Check common stats', () => {
        const config = { next: true };
        const stats = analytics(data, results, config);
        return assert.isFulfilled(stats);
    });

    it('Check stats with no data', () => {
        const stats = analytics('test', results, 'config');
        return assert.isFulfilled(stats);
    });
});
