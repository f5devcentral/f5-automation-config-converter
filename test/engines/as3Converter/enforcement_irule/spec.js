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

const compareDeclaration = require('../compareDeclaration');
const as3Converter = require('../../../../src/engines/as3Converter');
const parse = require('../../../../src/engines/parser');
const readFiles = require('../../../../src/preConverter/readFiles');
const validator = require('../../validators/as3Adapter');

// inspired by test/engines/as3Converter/irule
// there are no counterparts for ex2 and ex5
const ex1 = require('./enforcement_irule1.json');
const ex3 = require('./enforcement_irule3.json');
const ex4 = require('./enforcement_irule4.json');

let json;

describe('Enforcement_iRule: basic pem irule', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/enforcement_irule/enforcement_irule1.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.Sample_pem_irule_01.testApp;
        const convertedDec = json.Sample_pem_irule_01.testApp;
        compareDeclaration(convertedDec, convertedDec);
        compareDeclaration(originalDec, originalDec);
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});

describe('Enforcement_iRule: pem irule with bracket { in a comment', () => {
    it('ex3', async () => {
        const data = await readFiles(['./test/engines/as3Converter/enforcement_irule/enforcement_irule3.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex3.Sample_pem_irule_01;
        const convertedDec = json.Sample_pem_irule_01;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex3 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});

describe('Enforcement_iRule: pem irule with escaped_brackets {', () => {
    it('ex4', async () => {
        const data = await readFiles(['./test/engines/as3Converter/enforcement_irule/enforcement_irule4.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex4.Sample_pem_irule_01;
        const convertedDec = json.Sample_pem_irule_01;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex4 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
