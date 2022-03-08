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
const removeIapp = require('../../src/preConverter/removeIapp');

describe('Test removeIapp function (removeIapp.js)', () => {
    it('Should remove iApp from config ', () => {
        const as3Json = {
            'ltm pool /AS3/test.app/test_pool': { 'app-service': 'none' },
            'ltm pool /AS3/test_app/test_pool_2': { 'app-service': 'none' },
            'ltm test /AS3/test/test_obj': { 'app-service': 'none' },
            'ltm test2 /AS3/test2/test_obj2': { 'app-service': 'none' }
        };

        const supportedJson = {
            'ltm pool /AS3/test.app/test_pool': { 'app-service': 'none' },
            'ltm pool /AS3/test_app/test_pool_2': { 'app-service': 'none' }
        };

        const ex0 = { 'ltm pool /AS3/test.app/test_pool': { 'app-service': 'none' } };

        // Clean up supported and AS3: remove iapp objects
        const unsupportedObj = removeIapp(as3Json, supportedJson, []);
        assert.deepStrictEqual(ex0, unsupportedObj);
    });
});
