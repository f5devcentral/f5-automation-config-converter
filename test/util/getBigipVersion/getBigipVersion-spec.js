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
const getBigipVersion = require('../../../src/util/getBigipVersion');
const readFiles = require('../../../src/preConverter/readFiles');

describe('Test getBigipVersion function (getBigipVersion.js)', () => {
    it('Should return expected version ', async () => {
        const data = await readFiles(['./test/util/getBigipVersion/test.conf']);
        const version = getBigipVersion(data);
        assert.strictEqual(version, '13.1.1.3');
    });
});
