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

const fs = require('fs');
const countObjects = require('../util/countObjects');
const log = require('../util/log');

module.exports = (result, config) => {
    const jsonDeclaration = JSON.stringify(result.declaration, null, 4);
    const {
        jsonCount, as3Recognized, as3Converted, as3NotConverted, declarationInfo
    } = result.metadata;

    if (config.declarativeOnboarding) {
        log.info(`${jsonCount} BIG-IP objects detected total`);
        log.info(`${declarationInfo.total} DO stanzas generated`);
    } else {
        // Log as3Recognized objects
        if (config.as3Recognized) {
            log.info('------ AS3-Recognized objects ------');
            Object.keys(as3Recognized).forEach((x) => log.info(x));
            log.info('--- end of AS3-Recognized objects ---');
        }

        // Log converted objects
        if (config.as3Converted) {
            log.info('------- AS3-Converted objects ------');
            Object.keys(as3Converted).forEach((x) => log.info(x));
            log.info('--- end of AS3-Converted objects ---');
        }

        // Log not converted objects
        if (config.as3NotConverted) {
            log.info('------- AS3-Not-Converted objects ------');
            Object.keys(as3NotConverted).forEach((x) => log.info(x));
            log.info('--- end of AS3-Not-Converted objects ---');
        }

        log.info(`${jsonCount} BIG-IP objects detected total`);
        log.info(`${countObjects(as3Recognized)} BIG-IP objects recognized by AS3`);
        log.info(`${countObjects(as3Converted)} BIG-IP objects supported by ACC`);
        log.info(`${declarationInfo.total} AS3 stanzas generated`);
    }

    if (config.summary) log.info(JSON.stringify(declarationInfo.classes, null, 4));

    if (config.debug) log.info(jsonDeclaration);

    if (config.output) {
        try {
            fs.writeFileSync(config.output, jsonDeclaration);
        } catch (e) {
            log.error('Error writing output file.');
            if (!config.debug) {
                log.info('*** You can still specify --debug option to get result as a console output. ***');
            }
        }
    }
};
