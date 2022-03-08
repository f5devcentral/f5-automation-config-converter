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
const as3Converter = require('../../../../src/engines/as3Converter');
const parse = require('../../../../src/engines/parser');
const readFiles = require('../../../../src/preConverter/readFiles');
const validator = require('../../validators/as3Adapter');

const ex1 = require('./irule.json');
const ex2 = require('./irule2.json');
const ex3 = require('./irule3.json');
const ex4 = require('./irule4.json');
const ex5 = require('./irule5.json');

let json;

describe('iRule: ltm rule', () => {
    it('ex1', async () => {
        const data = await readFiles(['./test/engines/as3Converter/irule/irule.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex1.AS3_Tenant.AS3_Application;
        const convertedDec = json.AS3_Tenant.AS3_Application;
        assert.deepStrictEqual(originalDec.hashRuleCommonShared, convertedDec.hashRuleCommonShared);
        assert.deepStrictEqual(originalDec.universalRuleCommonShared, convertedDec.universalRuleCommonShared);
        assert.deepStrictEqual(originalDec.theRule1, convertedDec.theRule1);
        assert.deepStrictEqual(originalDec.theRule2, convertedDec.theRule2);
    });

    it('ex1 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check that references in irules '/Common/reference' has been converted to '/Common/Shared/reference'
    it('ex2', async () => {
        const data = await readFiles(['./test/engines/as3Converter/irule/irule2.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex2.Common.Shared;
        const convertedDec = json.Common.Shared;
        assert.deepStrictEqual(originalDec.test_rule_1, convertedDec.test_rule_1);
        assert.deepStrictEqual(originalDec.test_rule_2, convertedDec.test_rule_2);
    });

    it('ex2 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check conversion comments contained brackets { or }
    it('ex3', async () => {
        const data = await readFiles(['./test/engines/as3Converter/irule/irule3.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex3.Common.Shared;
        const convertedDec = json.Common.Shared;
        assert.deepStrictEqual(originalDec.test_iRule, convertedDec.test_iRule);
    });

    it('ex3 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Check iRule with escaped brackets { or }
    it('ex4', async () => {
        const data = await readFiles(['./test/engines/as3Converter/irule/irule4.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex4.Common.Shared;
        const convertedDec = json.Common.Shared;
        assert.deepStrictEqual(originalDec.test_iRule, convertedDec.test_iRule);
    });

    it('ex4 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));

    // Exclude specific iRule lines: set and STREAM
    it('ex5', async () => {
        const data = await readFiles(['./test/engines/as3Converter/irule/irule5.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex5.Common.Shared;
        const convertedDec = json.Common.Shared;
        assert.deepStrictEqual(originalDec.test_iRule, convertedDec.test_iRule);
    });

    it('ex5 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
