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
const sinon = require('sinon');
const log = require('../../src/util/log');
const { main } = require('../../src/main');

describe('Test aggregate-logging function (logObjects.js)', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('Should log AS3-recognized objects when requested', async () => {
        const logSpy = sinon.spy(log, 'info');
        const conf = {
            as3Recognized: true,
            conf: './test/logObjects/logObjects.conf'
        };
        await main(null, conf);

        const firstMsg = logSpy.getCall(0).firstArg;
        const secondMsg = logSpy.getCall(1).firstArg;

        assert(firstMsg.includes('AS3-Recognized'));
        assert(secondMsg.includes('ltm pool'));
    });

    it('Should log AS3-converted objects when requested', async () => {
        const logSpy = sinon.spy(log, 'info');
        const conf = {
            as3Converted: true,
            conf: './test/logObjects/logObjects.conf'
        };
        await main(null, conf);

        const firstMsg = logSpy.getCall(0).firstArg;
        const secondMsg = logSpy.getCall(1).firstArg;

        assert(firstMsg.includes('AS3-Converted'));
        assert(secondMsg.includes('ltm pool'));
    });

    it('Should log AS3-not-converted objects when requested', async () => {
        const logSpy = sinon.spy(log, 'info');
        const conf = {
            as3NotConverted: true,
            conf: './test/logObjects/logObjects.conf'
        };
        await main(null, conf);

        const firstMsg = logSpy.getCall(0).firstArg;
        const secondMsg = logSpy.getCall(1).firstArg;

        assert(firstMsg.includes('AS3-Not-Converted'));
        assert(secondMsg.includes('sys ntp'));
    });

    it('Should convert to Declarative Onboarding when requested', async () => {
        const logSpy = sinon.spy(log, 'info');
        const conf = {
            declarativeOnboarding: true,
            conf: './test/logObjects/logObjects.conf'
        };
        await main(null, conf);

        const firstMsg = logSpy.getCall(0).firstArg;
        const secondMsg = logSpy.getCall(1).firstArg;

        assert(firstMsg.includes('4 BIG-IP objects detected total'));
        assert(secondMsg.includes('1 DO stanzas generated'));
    });
});
