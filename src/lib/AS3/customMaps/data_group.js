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

const unquote = require('../../../util/convert/unquote');

module.exports = {

    // Data_Group
    'ltm data-group internal': {
        class: 'Data_Group',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // don't generate AS3-request/declaration Data_Groups
            if (loc.profile.includes('appsvcs')) return {};

            if (rootObj.records && !rootObj.keyDataType) {
                rootObj.keyDataType = 'string';
            }

            // remap data_group records
            if (rootObj.records) {
                rootObj.records = Object.keys(rootObj.records)
                    .map((x) => {
                        // eslint-disable-next-line no-useless-escape
                        const keyValue = rootObj.keyDataType === 'integer' ? parseInt(x, 10) : x.replace(/\"/g, '').replace(/\\\\/g, '\\');
                        return {
                            key: keyValue === ' ' ? '\\ ' : keyValue,
                            value: unquote(rootObj.records[x].data || '')
                        };
                    });
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    'ltm data-group external': {
        class: 'Data_Group',

        keyValueRemaps: {
            dataGroupFile: (key, val) => ({ dataGroupFile: { bigip: val } })

        },

        customHandling: (rootObj, loc, origObj) => {
            const newObj = {};
            rootObj.storageType = 'external';

            // pull extra props from ref'd 'sys file data-group'
            if (rootObj.dataGroupFile) {
                const dgfPath = rootObj.dataGroupFile.bigip;
                const dgFile = origObj[`sys file data-group ${dgfPath}`];

                rootObj.separator = dgFile.separator || ':=';

                if (dgFile['source-path']) {
                    rootObj.externalFilePath = dgFile['source-path'];
                    delete rootObj.dataGroupFile;
                }
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
