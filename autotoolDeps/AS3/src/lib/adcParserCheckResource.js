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

const util = require('./util/util');
const authHeaderUtil = require('./util/authHeaderUtil');

function checkResource(targetData, dataPath, parent, destPpty, root, context) {
    const urlObj = Object.assign(
        { skipCertificateCheck: false },
        !targetData.url ? { url: targetData } : targetData
    );

    const hdrs = {};
    return Promise.resolve()
        .then(() => authHeaderUtil.getAuthHeader(context, urlObj.authentication))
        .then((authHeader) => Object.assign(hdrs, authHeader))
        .then(() => util.getExtraHeaders(urlObj))
        .then((extraHeaders) => Object.assign(hdrs, extraHeaders))
        .then(() => {
            const timeout = util.getDeepValue(context, `tasks.${context.currentIndex}.resourceTimeout`);
            const options = {
                method: 'HEAD',
                headers: hdrs,
                why: (`for ${dataPath}`),
                rejectUnauthorized: !urlObj.skipCertificateCheck,
                timeout
            };
            return util.httpRequest(urlObj.url, options);
        })
        .then(() => Promise.resolve(true))
        .catch((error) => {
            error.status = 422;
            error.message = `Could not reach ${urlObj.url} for ${dataPath}`;
            throw error;
        });
}

function handleCheckResource(context, checks) {
    return Promise.all(checks.map((check) => checkResource(
        check.data, check.dataPath, check.parentData, check.pptyName, check.rootData, context
    )));
}

module.exports = {
    handleCheckResource
};
