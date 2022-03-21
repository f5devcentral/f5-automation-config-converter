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
const removeInvalidRefs = require('../../../src/postConverter/removeInvalidRefs');
const validator = require('../../engines/validators/as3Adapter');

const ex1 = require('./removeInvalidRefs.json');
const ex2 = require('./removeInvalidRefs2.json');
const ex3 = require('./removeInvalidRefs3.json');
const ex4 = require('./removeInvalidRefs4.json');

describe('Remove invalid refs (removeInvalidRefs.js)', () => {
    describe('wrapped bigip/use ref', () => {
        it('should not validate declarations with invalid refs', () => validator(ex1)
            .then((data) => assert(!data.isValid)));

        it('should remove refs to non-existent classes', () => {
            removeInvalidRefs(ex1);
            return validator(ex1)
                .then((data) => assert(data.isValid, JSON.stringify(data, null, 4)));
        });
    });

    describe('unwrapped (string) ref', () => {
        it('should not validate declarations with invalid refs', () => validator(ex2)
            .then((data) => assert(!data.isValid)));

        it('should remove refs to non-existent classes', () => {
            removeInvalidRefs(ex2);
            return validator(ex2)
                .then((data) => assert(data.isValid, JSON.stringify(data, null, 4)));
        });
    });

    describe('array of wrapped bigip/use refs', () => {
        it('should not validate declarations with invalid refs', () => validator(ex3)
            .then((data) => assert(!data.isValid)));

        it('should remove refs to non-existent classes', () => {
            removeInvalidRefs(ex3);
            return validator(ex3)
                .then((data) => assert(data.isValid, JSON.stringify(data, null, 4)));
        });
    });

    describe('remove multiple refs', () => {
        it('should not validate declarations with invalid refs', () => validator(ex4)
            .then((data) => assert(!data.isValid)));

        it('should remove refs to non-existent classes', () => {
            removeInvalidRefs(ex4);
            return validator(ex4)
                .then((data) => assert(data.isValid, JSON.stringify(data, null, 4)));
        });
    });
});
