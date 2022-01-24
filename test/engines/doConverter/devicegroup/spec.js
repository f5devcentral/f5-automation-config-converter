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
const doConverter = require('../../../../src/engines/doConverter');
const parse = require('../../../../src/engines/parser');
const readFiles = require('../../../../src/preConverter/readFiles');
const validator = require('../../validators/doAdapter');

const ex1 = require('./devicegroup.json');
const ex2 = require('./devicegroup2.json');
const ex3 = require('./devicegroup3.json');
const ex4 = require('./devicegroup4.json');
const ex5 = require('./devicegroup5.json');
const ex6 = require('./devicegroup6.json');

let declaration;

describe('DeviceGroup: cm device-group', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/doConverter/devicegroup/devicegroup.conf']);
        const parsed = parse(data);
        declaration = doConverter(parsed);
        assert.deepStrictEqual(declaration, ex1);
    });

    it('ex1 validation', () => validator(declaration)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    it('ex2', async () => {
        const data = await readFiles(['./test/engines/doConverter/devicegroup/devicegroup2.conf']);
        const parsed = parse(data);
        declaration = doConverter(parsed);
        assert.deepStrictEqual(declaration, ex2);
    });

    it('ex2 validation', () => validator(declaration)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // test with bad self ip address
    it('ex3', async () => {
        const data = await readFiles(['./test/engines/doConverter/devicegroup/devicegroup3.conf']);
        const parsed = parse(data);
        declaration = doConverter(parsed);
        assert.deepStrictEqual(declaration, ex3);
    });

    // test with empty HA classes
    it('ex4', async () => {
        const data = await readFiles(['./test/engines/doConverter/devicegroup/devicegroup4.conf']);
        const parsed = parse(data);
        declaration = doConverter(parsed);
        assert.deepStrictEqual(declaration, ex4);
    });

    it('ex4 validation', () => validator(declaration)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // test without MirrorIp
    it('ex5', async () => {
        const data = await readFiles(['./test/engines/doConverter/devicegroup/devicegroup5.conf']);
        const parsed = parse(data);
        declaration = doConverter(parsed);
        assert.deepStrictEqual(declaration, ex5);
    });

    it('ex5 validation', () => validator(declaration)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // test without MirrorIp and ConfigSync
    it('ex6', async () => {
        const data = await readFiles(['./test/engines/doConverter/devicegroup/devicegroup6.conf']);
        const parsed = parse(data);
        declaration = doConverter(parsed);
        assert.deepStrictEqual(declaration, ex6);
    });

    it('ex6 validation', () => validator(declaration)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
