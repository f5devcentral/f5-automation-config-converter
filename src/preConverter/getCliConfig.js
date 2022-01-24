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

/* eslint-disable no-console */

'use strict';

const { program } = require('commander');

module.exports = () => {
    program
        .usage('[options] <file ...>')
        .option('-c, --conf <path>', 'Specify path to input conf/SCF file.')
        .option('-u, --ucs <path>', 'Specify path to input UCS file.')
        .option('-o, --output <path>', 'Specify output file for the converted declaration.')
        .option('-d, --debug', 'Logs generated declaration to stdout.')
        .option('--controls', 'Add debugging "Controls" stanza to declaration.')
        .option('--disable-analytics', 'Disable analytics and reporting.')
        .option('--log <file>', 'Writes log output to the specified file.')
        .option('--recognized', 'Logs list of recognized BIG-IP object types to console.')
        .option('--recognized-objects <path>', 'Logs recognized BIG-IP objects to specified output file.')
        .option('--summary', 'Displays count of each generated declaration class.')
        .option('--safe-mode <bool>', 'Enable to skip post-conversion processing.')
        .option('-v, --vs-name <tenant/application/vs_name>', 'Filter output by the virtual server name.')
        .option('-a, --application-target <application_target>', 'Put virtual server to specific application. Works only if --vs-name specified. Original VS application used if option not specified.')
        .option('-t, --tenant-target <tenant_target>', 'Put virtual server to specific tenant. Works only if --vs-name specified. Original VS tenant used if option not specified.')
        .option('-e, --extended', 'Show default values in converted stanzas.')
        .option('--declarative-onboarding', 'Enable experimental DO conversion.')

        .option('--supported', 'Logs list of supported BIG-IP object types to console.')
        .option('--supported-objects <path>', 'Logs supported BIG-IP objects to specified output file.')
        .option('--unsupported', 'Logs list of unsupported BIG-IP object types to console.')
        .option('--unsupported-objects <path>', 'Logs unsupported BIG-IP objects to specified output file.');

    program.parse(process.argv);
    const options = program.opts();
    const config = {
        tenantTarget: options.tenantTarget,
        applicationTarget: options.applicationTarget,
        vsName: options.vsName,
        conf: options.conf,
        container: process.env.DOCKER_CONTAINER === 'true',
        controls: options.controls,
        debug: options.debug,
        disableAnalytics: options.disableAnalytics,
        logFile: options.log,
        output: options.output || 'output.json',
        recognized: options.recognized,
        recognizedObjects: options.recognizedObjects,
        safeMode: options.safeMode === 'true',
        summary: options.summary,
        ucs: options.ucs,
        showExtended: options.extended,
        declarativeOnboarding: options.declarativeOnboarding,

        supported: options.supported,
        supportedObjects: options.supportedObjects,
        unsupported: options.unsupported,
        unsupportedObjects: options.unsupportedObjects
    };

    if ((config.ucs && config.conf) || (!config.ucs && !config.conf)) {
        console.error('Invalid option, please select one input type: UCS or conf/SCF.');
        process.exit(0);
    }
    return config;
};
