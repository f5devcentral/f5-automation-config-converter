/**
 * Copyright 2021 F5 Networks, Inc.
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
const log = require('../util/log');

module.exports = (result, config) => {
    const jsonDeclaration = JSON.stringify(result.declaration, null, 4);
    const {
        jsonCount, as3Json, as3JsonCount, supportedJson, supportedJsonCount,
        declarationInfoTotal, declarationInfoClasses, unsupportedObj
    } = result.metaData;

    // temporary pending DO object analysis
    if (config.declarativeOnboarding) {
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
        return;
    }

    // Log recognized objects
    if (config.recognized) {
        log.info('------ Recognized objects ------');
        Object.keys(as3Json).forEach((x) => log.info(x));
        log.info('-- end of Recognized objects ---');
    }
    if (config.recognizedObjects) {
        fs.writeFileSync(config.recognizedObjects, JSON.stringify(as3Json, null, 4));
    }

    // Log supported objects
    if (config.supported) {
        log.info('------- Supported objects ------');
        Object.keys(supportedJson).forEach((x) => log.info(x));
        log.info('--- end of Supported objects ---');
    }
    if (config.supportedObjects) {
        fs.writeFileSync(config.supportedObjects, JSON.stringify(supportedJson, null, 4));
    }

    // Log unsupported/unconverted objects
    if (config.unsupported) {
        log.info('------ Unsupported objects -----');
        Object.keys(unsupportedObj).forEach((x) => log.info(x));
        log.info('-- end of Unsupported objects --');
    }
    if (config.unsupportedObjects) {
        fs.writeFileSync(config.unsupportedObjects, JSON.stringify(unsupportedObj, null, 4));
    }

    log.info(`${jsonCount} BIG-IP objects detected total`);
    log.info(`${as3JsonCount} BIG-IP objects recognized by AS3`);
    log.info(`${supportedJsonCount} BIG-IP objects supported by ACC`);
    log.info(`${declarationInfoTotal} AS3 stanzas generated`);

    if (config.summary) log.info(JSON.stringify(declarationInfoClasses, null, 4));

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
