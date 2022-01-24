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

const reporters = ['html', 'progress'];
let badgeReporter;
let plugins;

try {
    const badgeReporterPath = require.resolve('stryker-mutator-badge-reporter');
    plugins = ['@stryker-mutator/*', badgeReporterPath];
    reporters.push('badge');
    badgeReporter = {
        label: 'mutation'
    };
} catch (e) {
    // ignore failure
}

module.exports = {
    packageManager: 'npm',
    plugins,
    reporters,
    badgeReporter,
    testRunner: 'mocha',
    coverageAnalysis: 'perTest',
    mutate: ['src/**/*.js'],
    mochaOptions: {
        spec: ['test/**/*.js']
    }
};
