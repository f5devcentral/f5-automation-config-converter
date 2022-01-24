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

/* eslint-disable consistent-return */

const log = require('../util/log');
const as3Schema = require('../../autotoolDeps/AS3/src/schema/latest/adc-schema.json');

module.exports = (declaration) => {
    const newObj = { ...declaration };
    findProfiles(newObj);
    return newObj;
};

// schema objects are extended. traverse and find default.
function findSchemaDefault(as3Class, propName) {
    const definition = as3Schema.definitions[as3Class];
    if (!definition) return;

    const propDefinition = definition.properties[propName];
    if (propDefinition && Object.prototype.hasOwnProperty.call(propDefinition, 'default')) {
        return propDefinition.default;
    }

    // improve this check on the 'if' property. if isn't always true, sometimes it's an object
    if (propDefinition && Object.prototype.hasOwnProperty.call(propDefinition, 'if')) {
        const ref = propDefinition.then.$ref || propDefinition.else.$ref;
        if (ref) {
            const refClass = ref.split('/')[2];
            const refDef = as3Schema.definitions[refClass];
            if (refDef.properties) {
                const refPropDef = refDef.properties[propName];
                if (refPropDef && Object.prototype.hasOwnProperty.call(refPropDef, 'default')) {
                    return refPropDef.default;
                }
            }
        }
    }
}

const arrayEquals = (a, b) => Array.isArray(a)
    && Array.isArray(b)
    && a.length === b.length
    && a.every((val, i) => val === b[i]);

// match and remove default values
function matchDefaults(as3Obj) {
    Object.keys(as3Obj)
        .filter((k) => k !== 'class')
        .forEach((propName) => {
            try {
                const propVal = as3Obj[propName];
                const propDefault = findSchemaDefault(as3Obj.class, propName);

                // need to deep check here. include strings and arrays
                if (propDefault !== 'undefined'
                    && (propVal === propDefault || arrayEquals(propVal, propDefault))) {
                    delete as3Obj[propName];
                }
            } catch (e) {
                log.warn(`Failed to find default schema value for: ${as3Obj.class}.${propName}`);
            }
        });
    return as3Obj;
}

// recursive function to find AS3 objects
function findProfiles(obj) {
    Object.keys(obj)
        .filter((k) => typeof obj[k] === 'object' && obj[k].class)
        .forEach((key) => {
            if (obj[key].class === 'Tenant' || obj[key].class === 'Application') {
                return findProfiles(obj[key]);
            }
            return matchDefaults(obj[key]);
        });
    return obj;
}
