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

const handleObjectRef = require('../../../util/convert/handleObjectRef');
const unquote = require('../../../util/convert/unquote');

module.exports = {

    // Log_Destination (remote-high-speed-log)
    'sys log-config destination remote-high-speed-log': {
        class: 'Log_Destination',

        keyValueRemaps: {
            pool: (key, val) => ({ pool: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.type = 'remote-high-speed-log';

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Log_Destination (remote-syslog)
    'sys log-config destination remote-syslog': {
        class: 'Log_Destination',

        keyValueRemaps: {
            remoteHighSpeedLog: (key, val) => ({ remoteHighSpeedLog: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.type = 'remote-syslog';

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Log_Publisher
    'sys log-config publisher': {
        class: 'Log_Publisher',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            rootObj.destinations = rootObj.destinations
                ? Object.keys(rootObj.destinations).map((x) => handleObjectRef(x))
                : [];

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
