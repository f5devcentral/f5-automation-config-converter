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

// input: '/Tenant1/App1/Profile1'
// output: {app: 'App1', tenant: 'Tenant1', profile: 'Profile1'}

const formatStr = require('./formatStr');

module.exports = (str) => {
    const strFormated = formatStr(str);
    const split = strFormated.split('/');
    const tenant = split[1];
    const app = split[2];
    const profile = split[3];

    return {
        app,
        iapp: app.endsWith('.app'),
        original: str,
        profile,
        tenant
    };
};
