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

/**
 * Recursive function find and delete object/property by path
 *
 * Note:
 * - mutates 'obj'
 *
 * @param {Object} obj - source json object
 * @param {Array} objPath - path to object within the top original object to delete [a, b, c]
 * @param {Number} depth - depth of property
 *
 * @returns {Object} source json object
 */
const deleteProperty = (obj, objPath, depth) => {
    depth = !depth ? 0 : depth;
    const objKey = objPath[depth];

    if ((objPath.length - 1) === depth) {
        if (Array.isArray(obj)) {
            // that part process path like /Obj/1
            obj.splice(objKey, 1);
        } else {
            delete obj[objKey];
        }
    } else {
        obj[objKey] = deleteProperty(obj[objKey], objPath, depth + 1);
    }

    // delete parent empty object
    Object.keys(obj).forEach((key) => {
        const val = obj[key];
        if (typeof val === 'object'
            && ((Array.isArray(val) && val.length === 0)
                || Object.keys(val).length === 0)) {
            if (Array.isArray(obj)) {
                obj.splice(objKey, 1);
            } else {
                delete obj[key];
            }
        }
    });

    return obj;
};

/**
 * Function find and delete object/property by path
 *
 * Note:
 * - mutates 'obj'
 *
 * @param {Object} obj - source json object
 * @param {String} pathToProp - path to object to delete /a/b/c
 *
 * @returns {Object} source json object
 */
module.exports = (obj, pathToProp) => {
    const objPath = pathToProp.split('/').slice(1);
    deleteProperty(obj, objPath);
};
