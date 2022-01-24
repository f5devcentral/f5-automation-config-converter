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

const sinon = require('sinon');
const log = require('../../src/util/log');

const assert = sinon.assert;
let consoleLogSpy;

describe('Check logger based on winston', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('log.info() should be called', () => {
        consoleLogSpy = sinon.spy(log, 'info');
        const message = 'Test log.info message';
        log.info(message);
        assert.calledWith(consoleLogSpy, message);
    });

    it('log.warn() should be called', () => {
        consoleLogSpy = sinon.spy(log, 'warn');
        const message = 'Test log.warn message';
        log.warn(message);
        assert.calledWith(consoleLogSpy, message);
    });

    it('log.error() should be called', () => {
        consoleLogSpy = sinon.spy(log, 'error');
        const message = 'Test log.error message';
        log.error(message);
        assert.calledWith(consoleLogSpy, message);
    });

    it('log.debug() should be called', () => {
        consoleLogSpy = sinon.spy(log, 'debug');
        const message = 'Test log.debug message';
        log.debug(message);
        assert.calledWith(consoleLogSpy, message);
    });

    it('file transport should be called', () => {
        consoleLogSpy = sinon.stub(log, 'configure').resolves();
        const fileName = 'test_file.log';
        log.configure(fileName);
        assert.calledWith(consoleLogSpy, fileName);
    });

    it('stream transport should be called', () => {
        consoleLogSpy = sinon.stub(log, 'memory').resolves();
        log.memory();
        assert.calledWith(consoleLogSpy);
    });
});
