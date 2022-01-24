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
const filterConf = require('../../../src/preConverter/filterConf');
const getMergedAS3Properties = require('../../../src/util/getMergedAS3Properties');
const parse = require('../../../src/engines/parser');
const readFiles = require('../../../src/preConverter/readFiles');

describe('Test filterConf function (filterConf.js)', () => {
    it('Should remove unsupported objects from config ', async () => {
        const ex0 = {
            'ltm pool /AS3/test.app/test_pool': { 'app-service': 'none' },
            'ltm pool /AS3/test_app/test_pool_2': { 'app-service': 'none' }
        };

        const data = await readFiles(['./test/preConverter/filterConf/test.conf']);
        const json = parse(data);

        // extend as3Properties with custom
        const as3PropertiesExt = getMergedAS3Properties();

        // apply whitelist for AS3 and ACC support
        const as3Json = filterConf(json, as3PropertiesExt);
        assert.deepStrictEqual(as3Json, ex0);
    });
});
