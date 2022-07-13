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
const removeInvalidRefs = require('./postConverter/removeInvalidRefs');
const supported = require('./lib/AS3/customDict');

/**
 * Filter objects by array
 *
 * Note:
 * - mutates 'obj'
 *
 * @param {Object} obj - json
 * @param {Array} filter - array of objects by filter
 *
 * @returns {Object} source json object
 * @returns {Array} list of Next supported keys
 */
const nextFilteredObjects = (obj, filter) => {
    const as3NextNotConverted = {};
    const keyNextConverted = [];

    const filterArray = filter.slice(0);

    Object.keys(obj).forEach((key) => {
        const i = filterArray.indexOf(key.split(' ').splice(-1)[0]);
        if (i !== -1) {
            as3NextNotConverted[key] = obj[key];
            filterArray.splice(i, 1);
        } else {
            keyNextConverted.push(key);
        }
    });

    // -- try to recognize undefined objects
    // objects can have name /<>/<>/test or /Common/test
    // in second case for /Common/test it will be replaced to /Common/Shared/test for AS3
    // when we try to identify type of objects we remove 'Shared' and use full name
    // if we had initial name like /Common/test/test, such object will not be identified
    // and we should make additional checks
    filterArray.forEach((item) => {
        const tmpStr = item.split('/').at(-1);
        let foundKey = '';

        for (let i = 0; i < keyNextConverted.length; i += 1) {
            if (keyNextConverted[i].endsWith(tmpStr)) {
                foundKey = keyNextConverted[i];
                as3NextNotConverted[foundKey] = obj[foundKey];
                keyNextConverted.splice(i, 1);
                break;
            }
        }

        if (foundKey === '') {
            as3NextNotConverted[`<--undefined type--> ${item}`] = {};
        }
    });

    return { as3NextNotConverted, keyNextConverted };
};

async function mainRunner(data, config) {
    // Check if 'next' requested with next-not-converted
    if (config.nextNotConverted) {
        config.next = true;
    }

    log.debug(`Config ${JSON.stringify(config, null, 4)}`);
    const json = parser(data);

    // DO branch
    if (config.declarativeOnboarding) {
        if (config.next) log.warn('DO Next is not supported. Doing DO conversion');

        let doDecl = doConverter(json, config);

        // post-converters
        if (config.safeMode) {
            log.info('Running in safe mode, skipping postConverter transformations');
        } else if (!config.showExtended) {
            // Remove default values using DO schema
            log.debug('Removing default DO values from declaration');
            doDecl = removeDefaultValuesDO(doDecl);
        }

        return {
            declaration: doDecl,
            metadata: {
                declarationInfo: declarationStats(doDecl, config),
                jsonCount: countObjects(json)
            }
        };
    }

    // apply allowlist for AS3 and ACC support
    const as3Recognized = filterConf(json, getMergedAS3Properties());
    const as3Converted = filterConf(json, supported);

    // Convert json to AS3
    const converted = as3Converter(json, config);
    let declaration = converted.declaration;

    // Additional metrics for next
    const { as3NextNotConverted, keyNextConverted } = nextFilteredObjects(as3Converted,
        converted.keyNextNotSupported);

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
        metadata: {
            declarationInfo: declarationStats(declaration),
            jsonCount: countObjects(json),
            as3Recognized,
            as3Converted,
            keyNextConverted,
            as3NextNotConverted,
            as3NotConverted: converted.as3NotConverted,
            unsupportedStats: converted.unsupportedStats
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
        analytics(data, result, config);

        logObjects(result, config);
        result.metadata.logs = log.memory();

        return result;
    },

    // Function designed for integration with f5-chariot project, no external support.
    mainAPI: async (data, config = {}) => {
        config.chariot = true;
        config.showExtended = true;

        data = { 'config.conf': data };
        const result = await mainRunner(data, config);

        // Send analytics
        analytics(data, result, config);

        return result;
    }
};
