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
const readFiles = require('../../src/preConverter/readFiles');

describe('Load config (readFiles.js)', () => {
    it('should read files from a UCS', async () => {
        const fileList = [
            'config/bigip_user.conf',
            'config/bigip_base.conf',
            'config/.bigip_emergency.conf',
            'config/bigip.conf',
            'config/partitions/AS3_Tenant/bigip.conf'
        ];
        const files = await readFiles(['./test/basic_install.ucs']);
        assert.deepStrictEqual(Object.keys(files), fileList);
        assert.strictEqual(typeof files['config/bigip.conf'], 'string');
        assert.strictEqual(typeof files['config/bigip_base.conf'], 'string');
    });

    it('should read files from a config', async () => {
        const files = await readFiles(['./test/main/main.conf']);
        assert.strictEqual(typeof files['./test/main/main.conf'], 'string');
    });

    it('should persist the data via readFiles.data', async () => {
        const files = await readFiles(['./test/basic_install.ucs']);
        assert.deepStrictEqual(readFiles.data, files);
    });
});
