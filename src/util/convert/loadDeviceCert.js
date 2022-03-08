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

const readFiles = require('../../preConverter/readFiles');

const certPath = 'var/tmp/cert_temp/conf/ssl.crt/server.crt';
const keyPath = 'var/tmp/cert_temp/conf/ssl.key/server.key';

module.exports = (dataCert) => {
    const deviceCert = {};
    deviceCert.certificate = (dataCert && dataCert[certPath]) ? dataCert[certPath] : readFiles.data[certPath];
    deviceCert.privateKey = (dataCert && dataCert[keyPath]) ? dataCert[keyPath] : readFiles.data[keyPath];
    if (deviceCert.certificate && deviceCert.privateKey) return deviceCert;
    return false;
};
