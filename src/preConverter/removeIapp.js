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

const findLocation = require('../util/convert/findLocation');

// Clean up supported and AS3: remove iapp objects
module.exports = (as3Json, supportedJson, iappSupported) => {
    const unsupportedObj = {};
    Object.keys(supportedJson).forEach((checkKey) => {
        if (checkKey.includes('/') && !iappSupported.includes(checkKey)) {
            const loc = findLocation(checkKey);
            if (loc.iapp && !checkKey.startsWith('sys application service')) {
                unsupportedObj[checkKey] = supportedJson[checkKey];
                delete as3Json[checkKey];
                delete supportedJson[checkKey];
            }
        }
    });
    return unsupportedObj;
};
