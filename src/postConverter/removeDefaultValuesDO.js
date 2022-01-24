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

const systemSchema = require('../../autotoolDeps/DO/src/schema/latest/system.schema.json');
const networkSchema = require('../../autotoolDeps/DO/src/schema/latest/network.schema.json');
const dscSchema = require('../../autotoolDeps/DO/src/schema/latest/dsc.schema.json');
const analyticsSchema = require('../../autotoolDeps/DO/src/schema/latest/analytics.schema.json');
const authSchema = require('../../autotoolDeps/DO/src/schema/latest/auth.schema.json');
const gslbSchema = require('../../autotoolDeps/DO/src/schema/latest/gslb.schema.json');

const schemas = [systemSchema, networkSchema, dscSchema, analyticsSchema, authSchema, gslbSchema];

module.exports = (doDecl) => {
    const declaration = JSON.parse(JSON.stringify(doDecl));

    Object.keys(declaration.Common)
        .filter((o) => o !== 'class')
        .forEach((o) => {
            const obj = declaration.Common[o];
            const genClass = obj.class;
            schemas.forEach((schema) => {
                if (schema.allOf) {
                    schema.allOf.forEach((classItem) => {
                        const schemaClass = classItem?.if?.properties?.class?.const;
                        if (genClass === schemaClass) {
                            // iterate through properties and check for default

                            Object.keys(obj)
                                .filter((p) => p !== 'class')
                                .forEach((p) => {
                                    const properties = classItem?.then?.properties;
                                    if (properties?.[p]?.default === obj[p]) {
                                        delete declaration.Common[o][p];
                                    }
                                });
                        }
                    });
                }
            });
        });

    return declaration;
};
