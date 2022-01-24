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

const formatStr = require('./formatStr');
const defaults = require('../../lib/bigipDefaults.json');

module.exports = (str) => {
    str = formatStr(str);
    let pathSplit = '';
    if (defaults.includes(str)) return { bigip: str };
    pathSplit = str.split('/');
    if (pathSplit.length === 3) str = str.replace(`/${pathSplit[1]}/`, `/${pathSplit[1]}/Shared/`);
    return { use: str };
};
