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
const filterByApplication = require('../../../src/postConverter/filterByApplication');

const targetJson = require('./filtered.json');
const targetOnlyVs = require('./filtered_only_vs.json');
const targetOnlyVsAndAppl = require('./filtered_vs_and_application.json');
const targetOnlyVsAndTen = require('./filtered_vs_and_tenant.json');
const srcJson = require('./full.json');

describe('filter config (filterByApplication.js)', () => {
    it('should extract virtual server and dependents from full config, all options specified', () => {
        const config = { vsName: '/f5demo/f5demoApps/test_vs', applicationTarget: 'Appl', tenantTarget: 'Ten' };
        const resultJson = filterByApplication(srcJson, config);
        assert.deepStrictEqual(targetJson.Ten, resultJson.Ten);
    });
    it('should extract virtual server and dependents from full config, virtual server and target tenant specified', () => {
        const config = { vsName: '/f5demo/f5demoApps/test_vs', tenantTarget: 'Ten' };
        const resultJson = filterByApplication(srcJson, config);
        assert.deepStrictEqual(targetOnlyVsAndTen.Ten, resultJson.Ten);
    });
    it('should extract virtual server and dependents from full config, virtual server and  target application specified', () => {
        const config = { vsName: '/f5demo/f5demoApps/test_vs', applicationTarget: 'Appl' };
        const resultJson = filterByApplication(srcJson, config);
        assert.deepStrictEqual(targetOnlyVsAndAppl.f5demo, resultJson.f5demo);
    });
    it('should extract virtual server and dependents from full config, only virtual server specified', () => {
        const config = { vsName: '/f5demo/f5demoApps/test_vs' };
        const resultJson = filterByApplication(srcJson, config);
        assert.deepStrictEqual(targetOnlyVs.f5demo, resultJson.f5demo);
    });
    it('full config in result, unknown virtual server specified', () => {
        const config = { vsName: '/f5demo/f5demoApps/test_unknown_vs' };
        const resultJson = filterByApplication(srcJson, config);
        assert.deepStrictEqual(srcJson, resultJson);
    });
    it('full config in result, no virtual server specified', () => {
        const config = { applicationTarget: 'Appl', tenantTarget: 'Ten' };
        const resultJson = filterByApplication(srcJson, config);
        assert.deepStrictEqual(srcJson.Ten, resultJson.Ten);
    });
});
