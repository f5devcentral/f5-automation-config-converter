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
const arrToMultilineStr = require('../../src/util/parse/arrToMultilineStr');
const countIndent = require('../../src/util/parse/countIndent');
const getTitle = require('../../src/util/parse/getTitle');
const objToArr = require('../../src/util/parse/objToArr');
const removeIndent = require('../../src/util/parse/removeIndent');
const strToObj = require('../../src/util/parse/strToObj');

describe('Parser utils (util/parse)', () => {
    describe('arrToMultilineStr', () => {
        it('should return a multiline str', () => {
            const input = ['    syslog-include "',
                '/var/log/irules*log /var/log/ltm.ssl.log {',
                '  maxsize 250M',
                '  compress',
                '  missingok',
                '  notifempty',
                '  sharedscripts',
                '  rotate 10',
                '  postrotate',
                '    touch /var/log/hup_syslog',
                '  endscript',
                '}',
                '"'];
            const output = arrToMultilineStr(input);
            const expected = {
                'syslog-include': `"
/var/log/irules*log /var/log/ltm.ssl.log {
  maxsize 250M
  compress
  missingok
  notifempty
  sharedscripts
  rotate 10
  postrotate
    touch /var/log/hup_syslog
  endscript
}
"`
            };
            assert.deepStrictEqual(expected, output);
        });
    });

    describe('countIndent', () => {
        it('should count the leading whitespace', () => {
            const input = '    example text';
            const output = countIndent(input);
            assert.strictEqual(4, output);
        });
    });

    describe('getTitle', () => {
        it('should return the object title', () => {
            const input = 'ltm profile tcp /AS3_Tenant/AS3_Application/testItem {';
            const output = getTitle(input);
            assert.strictEqual('ltm profile tcp /AS3_Tenant/AS3_Application/testItem', output);
        });
    });

    describe('objToArr', () => {
        it('should return an array', () => {
            const input = 'known-methods { GET POST }';
            const output = objToArr(input);
            assert.deepStrictEqual(['GET', 'POST'], output);
        });
    });

    describe('removeIndent', () => {
        it('should remove 4 preceeding spaces from all lines in array', () => {
            const input = ['    example', '    text'];
            const output = removeIndent(input);
            assert.deepStrictEqual(['example', 'text'], output);
        });

        it('should only remove 4 spaces', () => {
            const input = ['      datadatadata'];
            const output = removeIndent(input);
            assert.deepStrictEqual(['  datadatadata'], output);
        });

        it('should not remove any other characters', () => {
            const input = ['test text here'];
            const output = removeIndent(input);
            assert.deepStrictEqual(['test text here'], output);
        });
    });

    describe('strToObj', () => {
        it('should return an object', () => {
            const input = 'description none';
            const output = strToObj(input);
            assert.deepStrictEqual({ description: 'none' }, output);
        });

        it('should return an object with a stringified key', () => {
            const input = 'ip-df-mode preserve';
            const output = strToObj(input);
            assert.deepStrictEqual({ 'ip-df-mode': 'preserve' }, output);
        });

        it('should stringify integers', () => {
            const input = 'idle-timeout 86400';
            const output = strToObj(input);
            assert.deepStrictEqual({ 'idle-timeout': '86400' }, output);
        });
    });
});
