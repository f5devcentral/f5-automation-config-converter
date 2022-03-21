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

const jsonpointer = require('jsonpointer');
const promiseUtil = require('@f5devcentral/atg-shared-utilities').promiseUtils;
const util = require('./util/util');
const SecretTag = require('./tag/secretTag');
const LongSecretTag = require('./tag/longSecretTag');

/**
 * An object that describes how to fetch the target declaration data
 * @typedef {Object} PostProcessInfo
 * @property {string} instancePath - JSON pointer that references data in the declaration
 * @property {Object} [schemaData] - additional arbitrary data that is included in the
 *                                   f5PostProcess keyword instance
 */

/**
 * An array of objects that need to be processed with a specific function
 * @typedef {PostProcessInfo[]} PostProcessInfoGroup
 */

class PostProcessor {
    /**
     * Process declaration data that was tagged by the f5PostProcess keyword during AJV validation.
     * DECLARATION IS MODIFIED!
     * @param {Object} context - The current context object
     * @param {Object} declaration - The current declaration that was validated by AJV
     * @param {Object.<PostProcessInfoGroup>} [postProcess] - The saved info that will be used to
     *                                                        gather and process declaration data
     * @returns {Promise} - Promise resolves when all data is processed
     */
    static process(context, declaration, postProcess) {
        if (!context) {
            return Promise.reject(new Error('Context is required.'));
        }
        if (!declaration) {
            return Promise.reject(new Error('Declaration is required.'));
        }

        const postProcessObj = util.simpleCopy(postProcess) || {};
        const tagProcessors = [SecretTag, LongSecretTag];
        const processFunctions = tagProcessors.map((processor) => () => {
            const data = gatherData(declaration, postProcessObj[processor.TAG]);
            return processor.process(context, declaration, data);
        });

        return promiseUtil.series(processFunctions);
    }
}

/**
 * Gathers the necessary declaration data using the provided info.
 * @param {Object} declaration - The current declaration that was validated by AJV
 * @param {PostProcessInfoGroup} [infoGroup] - The array of info that will be used to fetch the
 *                                             declaration data
 * @returns {Object[]} - Data objects that includes declaration data and original info
 */
function gatherData(declaration, infoGroup) {
    return (infoGroup || []).map((info) => ({
        instancePath: info.instancePath,
        parentDataProperty: info.parentDataProperty,
        schemaData: info.schemaData,
        data: jsonpointer.get(declaration, info.instancePath),
        parentData: jsonpointer.get(declaration, info.instancePath.split('/').slice(0, -1).join('/'))
    }));
}

module.exports = PostProcessor;
