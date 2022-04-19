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
        .option('-d, --debug', 'Log generated declaration to console.')
        .option('--controls', 'Add debugging "Controls" stanza to declaration.')
        .option('--disable-analytics', 'Disable analytics and reporting.')
        .option('--log <file>', 'Output log to the specified file.')
        .option('--summary', 'Display summary of generated declaration.')
        .option('--safe-mode <bool>', 'Enable to skip post-conversion processing.')
        .option('-v, --vs-name <tenant/application/vs_name>', 'Filter output by the virtual server name.')
        .option('-a, --application-target <application_target>', 'Put virtual server to specific application. Works only if --vs-name specified. Original VS application used if option not specified.')
        .option('-t, --tenant-target <tenant_target>', 'Put virtual server to specific tenant. Works only if --vs-name specified. Original VS tenant used if option not specified.')
        .option('-e, --extended', 'Show default values in converted stanzas.')
        .option('--as3-recognized', 'Log list of AS3-recognized BIG-IP object types to console.')
        .option('--as3-converted', 'Log ACC/AS3-converted tmsh objects to console.')
        .option('--as3-not-converted', 'Log tmsh that were not directly converted')
        .option('--declarative-onboarding', 'Enable DO conversion instead of AS3.');

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
        safeMode: options.safeMode === 'true',
        summary: options.summary,
        ucs: options.ucs,
        showExtended: options.extended,
        as3Recognized: options.as3Recognized,
        as3Converted: options.as3Converted,
        as3NotConverted: options.as3NotConverted,
        declarativeOnboarding: options.declarativeOnboarding
    };

    if ((config.ucs && config.conf) || (!config.ucs && !config.conf)) {
        console.error('Invalid option, please select one input type: UCS or conf/SCF.');
        process.exit(1);
    }
    return config;
};
