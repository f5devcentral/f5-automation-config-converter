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

const decompress = require('decompress');
const log = require('../util/log');

// extract only relevant files from config and var
// decompress function accepts UCS path or UCS buffer
module.exports = (pathOrBuffer) => decompress(pathOrBuffer)
    .then((contents) => contents.filter((file) => {
        if (file.type === 'symlink') return false;
        const split = file.path.split('/');

        // keep config/*.conf
        if (split[0] === 'config' && split[1].endsWith('.conf')) {
            return true;
        }

        // keep config/bigip.license
        if (split[0] === 'config' && split[1].endsWith('.license')) {
            return true;
        }

        // keep config/partitions/**/*.conf
        if (file.path.startsWith('config/partitions') && file.path.endsWith('.conf')) {
            return true;
        }

        // skip var/tmp/filestore_temp/files_d/Common_d/epsec_package_d -- KB25633150
        if (file.path.includes('epsec_package_d')) {
            return false;
        }

        // keep var/tmp/filestore_temp/files_d/*
        if (file.path.startsWith('var/tmp/filestore_temp/files_d/Common_d'
            && (file.path.includes('.crt') || file.path.includes('.key')))) {
            return true;
        }

        return false;
    })).catch((err) => {
        log.error(err);
        throw new Error('Error extracting UCS');
    });
