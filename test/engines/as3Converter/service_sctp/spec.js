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

const ex0 = require('./service_sctp.json');

let json;

describe('Service SCTP: ltm virtual', () => {
    it('ex0', async () => {
        const data = await readFiles(['./test/engines/as3Converter/service_sctp/service_sctp.conf']);
        const parsed = parse(data);
        json = as3Converter(parsed).declaration;

        const originalDec = ex0.Sample_sctp_01.mySCTP;
        const convertedDec = json.Sample_sctp_01.mySCTP;
        compareDeclaration(originalDec, convertedDec);
    });

    it('ex0 validation', () => validator(json)
        .then((data) => assert(data.isValid, JSON.stringify(data, null, 4))));
});
