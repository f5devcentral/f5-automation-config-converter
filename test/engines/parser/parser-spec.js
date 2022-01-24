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
const parse = require('../../../src/engines/parser');
const readFiles = require('../../../src/preConverter/readFiles');

const ex1 = require('./ex1.json');
const ex2 = require('./ex2.json');
const ex3 = require('./ex3.json');
const ex4 = require('./ex4.json');
const ex5 = require('./ex5.json');
const ex6 = require('./ex6.json');
const ex7 = require('./ex7.json');
const ex8 = require('./ex8.json');
const ex9 = require('./ex9.json');
const ex10 = require('./ex10.json');
const ex11 = require('./ex11.json');
const ex12 = require('./ex12.json');
const ex13 = require('./ex13.json');
const ex14 = require('./ex14.json');
const ex15 = require('./ex15.json');

describe('Parse the config (parse.js)', () => {
    it('should parse the bigip-object into json-object', async () => {
        const data = await readFiles(['./test/engines/parser/ex1.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex1);
    });

    it('should parse nested bigip-objects into json-objects', async () => {
        const data = await readFiles(['./test/engines/parser/ex2.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex2);
    });

    it('should handle a mix of different data types', async () => {
        const data = await readFiles(['./test/engines/parser/ex3.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex3);
    });

    it('should handle iRules', async () => {
        const data = await readFiles(['./test/engines/parser/ex4.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex4);
    });

    it('should handle multiple iRules', async () => {
        const data = await readFiles(['./test/engines/parser/ex5.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex5);
    });

    it('should handle irregular (user-defined) indentation in iRules', async () => {
        const data = await readFiles(['./test/engines/parser/ex6.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex6);
    });

    it('should recognize a quoted bracket "{"', async () => {
        const data = await readFiles(['./test/engines/parser/ex7.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex7);
    });

    it('should recognize a multiline string', async () => {
        const data = await readFiles(['./test/engines/parser/ex8.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex8);
    });

    it('should handle escape chars', async () => {
        const data = await readFiles(['./test/engines/parser/ex9.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex9);
    });

    it('should skip cli script section', async () => {
        const data = await readFiles(['./test/engines/parser/ex10.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex10);
    });

    it('should handle windows line endings', async () => {
        const data = await readFiles(['./test/engines/parser/ex11.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex11);
    });

    it('should handle {} within string value', async () => {
        const data = await readFiles(['./test/engines/parser/ex12.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex12);
    });

    it('should handle invalid CSS', async () => {
        const data = await readFiles(['./test/engines/parser/ex13.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex13);
    });

    it('should right filter commented lines', async () => {
        const data = await readFiles(['./test/engines/parser/ex14.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex14);
    });

    it('should handle an unnamed array of objects', async () => {
        const data = await readFiles(['./test/engines/parser/ex15.conf']);
        const json = parse(data);
        assert.deepStrictEqual(json, ex15);
    });
});
