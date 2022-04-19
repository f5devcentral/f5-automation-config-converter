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

const as3PropertiesCustom = require('../lib/AS3/as3PropertiesCustom.json');
const as3Properties = require('../../autotoolDeps/AS3/src/lib/properties.json');

module.exports = () => {
    Object.keys(as3PropertiesCustom).forEach((property) => {
        if (property in as3Properties) {
            const ids = {};

            // Collect indexes for property ids
            for (let i = 0; i < as3Properties[property].length; i += 1) {
                ids[as3Properties[property][i].id] = i;
            }

            for (let i = 0; i < as3PropertiesCustom[property].length; i += 1) {
                const customProperty = as3PropertiesCustom[property][i];
                const customPropertyId = customProperty.id;

                // id present both in as3Properties and as3PropertiesCustom, merging
                if (customPropertyId in ids) {
                    const propertyIndex = ids[customPropertyId];
                    as3Properties[property][propertyIndex] = Object.assign(
                        as3Properties[property][propertyIndex],
                        customProperty
                    );

                // Add new id
                } else {
                    as3Properties[property].push(as3PropertiesCustom[property][i]);
                }
            }
        } else {
            as3Properties[property] = as3PropertiesCustom[property];
        }
    });
    return as3Properties;
};
