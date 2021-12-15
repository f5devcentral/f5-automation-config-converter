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

const log = require('../log');
const readFiles = require('../../preConverter/readFiles');

module.exports = (mockPath, loc, file) => {
    const nameSplit = mockPath.split('/');
    const isKey = mockPath.includes('.key');
    const bigipName = nameSplit[nameSplit.length - 1].replace(/-/g, '_').split('.');
    const name = bigipName.length > 1 ? bigipName.slice(0, -1).join('_') : bigipName[0];
    try {
        const certPath = file[`sys file ssl-${isKey ? 'key' : 'cert'} ${mockPath}`]['cache-path'];
        const fileName = certPath.split('/')[certPath.split('/').length - 1].replace(/:/g, '');
        const value = readFiles.data[`/var/tmp/filestore_temp/files_d/${loc.tenant}_d/certificate_${isKey ? 'key_' : ''}d/${fileName}`];

        if (!value) throw Error();
        return {
            name,
            value
        };
    } catch (e) {
        log.debug(`Unable to load ${isKey ? 'key' : 'cert'} ${mockPath}`);
        return { name };
    }
};
