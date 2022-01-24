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

const buildProtectedObj = require('../../../util/convert/buildProtectedObj');
const unquote = require('../../../util/convert/unquote');

const iruleRef = (val) => {
    const split = val.split('/').slice(1);
    if (split[0] === 'Common' && split[1] !== 'Shared') {
        return `/Common/Shared/${split[1]}`;
    }
    return val;
};

module.exports = {

    // Persist (cookie)
    'ltm persistence cookie': {
        class: 'Persist',

        lookupOverride: 'ltm persistence',

        keyValueRemaps: {
            cookieName: (key, val) => ({ cookieName: (val === 'none' ? '' : val) }),

            count: (key, val) => ({ hashCount: val }),

            duration: (key, val) => ({ duration: val === 'indefinite' ? 0 : val }),

            iRule: (key, val) => ({ iRule: iruleRef(val) }),

            passphrase: (key, val) => ({ passphrase: buildProtectedObj(val) }),

            ttl: (key, val) => {
                if (typeof val === 'string' && val.includes(':')) {
                    const split = val.split(':');
                    const hours = parseInt(split[0], 10) * 3600 * 7;
                    const minutes = parseInt(split[1], 10) * 60 * 7;
                    const seconds = parseInt(split[2], 10) * 7;
                    const rmdr = split[2] === '59' ? 6 : 0;
                    return { ttl: hours + minutes + seconds + rmdr };
                }
                return { ttl: val };
            }
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.persistenceMethod = 'cookie';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Persist (dest-addr)
    'ltm persistence dest-addr': {
        class: 'Persist',

        lookupOverride: 'ltm persistence',

        keyValueRemaps: {
            addressMask: (key, val) => ({ addressMask: val === 'none' ? '' : val }),

            duration: (key, val) => ({ duration: val === 'indefinite' ? 0 : val }),

            iRule: (key, val) => ({ iRule: iruleRef(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.persistenceMethod = 'destination-address';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Persist (hash)
    'ltm persistence hash': {
        class: 'Persist',

        lookupOverride: 'ltm persistence',

        keyValueRemaps: {
            endPattern: (key, val) => ({ endPattern: unquote(val).replace(/\\\\/g, '\\').replace(/\\\?/g, '?') }),

            iRule: (key, val) => ({ iRule: iruleRef(val) }),

            startPattern: (key, val) => ({ startPattern: unquote(val).replace(/\\\\/g, '\\') })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.persistenceMethod = 'hash';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Persist (msrdp)
    'ltm persistence msrdp': {
        class: 'Persist',

        lookupOverride: 'ltm persistence',

        keyValueRemaps: {
            iRule: (key, val) => ({ iRule: iruleRef(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.persistenceMethod = 'msrdp';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Persist (sip-info)
    'ltm persistence sip': {
        class: 'Persist',

        lookupOverride: 'ltm persistence',

        keyValueRemaps: {
            iRule: (key, val) => ({ iRule: iruleRef(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.persistenceMethod = 'sip-info';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Persist (source-addr)
    'ltm persistence source-addr': {
        class: 'Persist',

        lookupOverride: 'ltm persistence',

        keyValueRemaps: {
            addressMask: (key, val) => ({ addressMask: val === 'none' ? '' : val }),

            duration: (key, val) => ({ duration: val === 'indefinite' ? 0 : val }),

            iRule: (key, val) => ({ iRule: iruleRef(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.persistenceMethod = 'source-address';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Persist (tls-session-id)
    'ltm persistence ssl': {
        class: 'Persist',

        lookupOverride: 'ltm persistence',

        keyValueRemaps: {
            iRule: (key, val) => ({ iRule: iruleRef(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.persistenceMethod = 'tls-session-id';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Persist (universal)
    'ltm persistence universal': {
        class: 'Persist',

        lookupOverride: 'ltm persistence',

        keyValueRemaps: {
            iRule: (key, val) => ({ iRule: iruleRef(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.persistenceMethod = 'universal';
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
