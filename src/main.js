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

const analytics = require('./lib/analytics');
const as3Converter = require('./engines/as3Converter');
const countObjects = require('./util/countObjects');
const declarationStats = require('./lib/declarationStats');
const doConverter = require('./engines/doConverter');
const filterConf = require('./preConverter/filterConf');
const filterByApplication = require('./postConverter/filterByApplication');
const log = require('./util/log');
const logObjects = require('./lib/logObjects');
const getMergedAS3Properties = require('./util/getMergedAS3Properties');
const parser = require('./engines/parser');
const readFiles = require('./preConverter/readFiles');
const removeDefaultValuesAS3 = require('./postConverter/removeDefaultValuesAS3');
const removeDefaultValuesDO = require('./postConverter/removeDefaultValuesDO');
const removeIapp = require('./preConverter/removeIapp');
const removeInvalidRefs = require('./postConverter/removeInvalidRefs');
const supported = require('./lib/AS3/customDict');

async function mainRunner(data, config) {
    log.debug(`Config ${JSON.stringify(config, null, 4)}`);
    const json = parser(data);

    // DO branch
    if (config.declarativeOnboarding) {
        let doDecl = doConverter(json, config);

        // post-converters
        if (config.safeMode) {
            log.info('Running in safe mode, skipping postConverter transformations');
        } else if (!config.showExtended) {
            // Remove default values using DO schema
            log.debug('Removing default DO values from declaration');
            doDecl = removeDefaultValuesDO(doDecl);
        }

        const doStats = declarationStats(doDecl, config);

        return {
            declaration: doDecl,
            metaData: {
                declarationInfo: doStats,
                jsonCount: countObjects(json)
            }
        };
    }

    // apply allowlist for AS3 and ACC support
    const as3Json = filterConf(json, getMergedAS3Properties());
    const supportedJson = filterConf(json, supported);

    // Convert json to AS3
    const converted = as3Converter(json, config);
    let declaration = converted.declaration;

    // Clean up supported and AS3: remove iapp objects
    const unsupportedObj = removeIapp(as3Json, supportedJson, converted.iappSupported);
    Object.assign(unsupportedObj, ...converted.unsupportedObjects);

    // post-converters
    if (config.safeMode) {
        log.info('Running in safe mode, skipping postConverter transformations');
    } else {
        // Filter by virtual server name
        if (config.vsName) {
            log.debug('Filtering by Application');
            declaration = filterByApplication(declaration, config);
        }

        // Remove default values using AS3 schema
        if (!config.showExtended) {
            log.debug('Removing default AS3 values from declaration');
            declaration = removeDefaultValuesAS3(declaration);
        }

        // Remove any ref that points to a non-existant object
        log.debug('Removing invalid references');
        removeInvalidRefs(declaration);
    }

    return {
        declaration,
        metaData: {
            as3Json,
            as3JsonCount: countObjects(as3Json),
            declarationInfo: declarationStats(declaration),
            jsonCount: countObjects(json),
            supportedJson,
            supportedJsonCount: countObjects(supportedJson),
            unsupportedObj
        }
    };
}

module.exports = {
    main: async (data, config) => {
        // Init logger
        log.configure(config.logFile);

        // Read from file if data is not directly supplied
        if (!data) {
            const input = [config.conf, config.ucs].filter((x) => x);
            data = await readFiles(input);
        }

        if (config.ucs && config.server && Object.keys(data).length === 0) {
            throw new Error('Invalid UCS file provided. 0 objects found!');
        }

        const result = await mainRunner(data, config);

        // Send analytics
        analytics(data, result.declaration, config);

        logObjects(result, config);

        return {
            declaration: result.declaration,
            metaData: {
                logs: log.memory(),
                recognized: result.metaData.as3Json,
                declarationInfo: result.metaData.declarationInfo,
                supported: result.metaData.supportedJson,
                unSupported: result.metaData.unsupportedObj
            }
        };
    },

    // Function designed for integration with f5-chariot project, no external support.
    mainAPI: async (data, config = {}) => {
        config.chariot = true;
        config.showExtended = true;

        data = { 'config.conf': data };
        const result = await mainRunner(data, config);

        return {
            declaration: result.declaration,
            metaData: {
                recognized: result.metaData.as3Json,
                declarationInfo: result.metaData.declarationInfo,
                supported: result.metaData.supportedJson,
                unSupported: result.metaData.unsupportedObj
            }
        };
    }
};
