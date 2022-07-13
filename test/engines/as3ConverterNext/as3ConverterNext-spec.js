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

const compareDeclaration = require('../as3Converter/compareDeclaration');
const as3Converter = require('../../../src/engines/as3Converter');
const parse = require('../../../src/engines/parser');
const readFiles = require('../../../src/preConverter/readFiles');
const validator = require('../validators/as3NextAdapter');

const ex1 = require('./ex1.json');

let json;

describe('AS3 Next: simple conversion', () => {
    it('ex1: next', async () => {
        const data = await readFiles(['./test/engines/as3ConverterNext/ex1.conf']);
        const parsed = parse(data);
        const config = { next: true };
        json = as3Converter(parsed, config).declaration;

        const originalDec = ex1.Common;
        const convertedDec = json.Common;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex1 validation', () => assert(validator(json).isValid, JSON.stringify(validator(json), null, 4)));

    it('ex2: next-not-converted', async () => {
        const data = await readFiles(['./test/engines/as3ConverterNext/ex1.conf']);
        const parsed = parse(data);
        const config = { nextNotConverted: true, next: true };
        json = as3Converter(parsed, config).declaration;

        const originalDec = ex1.Common;
        const convertedDec = json.Common;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex2 validation', () => assert(validator(json).isValid, JSON.stringify(validator(json), null, 4)));
});
