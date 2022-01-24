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
const convertToNumberArray = require('../../../util/convert/convertToNumberArray');
const handleObjectRef = require('../../../util/convert/handleObjectRef');
const loadCertsAndKeys = require('../../../util/convert/loadCertsAndKeys');
const returnEmptyObjIfNone = require('../../../util/convert/returnEmptyObjIfNone');
const unquote = require('../../../util/convert/unquote');

const mapAdaptiveDivergence = (rootObj) => {
    if (rootObj.adaptive) {
        if (rootObj.adaptiveDivergenceType === undefined) {
            rootObj.adaptiveDivergenceType = 'relative';
            rootObj.adaptiveDivergenceMilliseconds = rootObj.adaptiveDivergenceMilliseconds || 100;
        }
        if (rootObj.adaptiveDivergenceType === 'absolute') {
            rootObj.adaptiveDivergenceMilliseconds = rootObj.adaptiveDivergencePercentage;
            delete rootObj.adaptiveDivergencePercentage;
        }
    }
    return rootObj;
};

const mapTargetAddressPort = (rootObj) => {
    if (rootObj.destination) {
        let split = rootObj.destination.split(':');
        const ipv6 = split.length > 2;
        if (ipv6) split = rootObj.destination.split('.');
        rootObj.targetAddress = split[0] === '*' ? '' : split[0];
        rootObj.targetPort = split[0] === '*' ? 0 : parseInt(split[1], 10) || split[1];
        delete rootObj.destination;
    }
    return rootObj;
};

module.exports = {

    // Monitor (DNS)
    'ltm monitor dns': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'dns';

            rootObj = mapTargetAddressPort(rootObj);

            rootObj.upInterval = rootObj.upInterval || 0;
            rootObj.transparent = rootObj.transparent || false;
            rootObj.reverse = rootObj.reverse || false;
            rootObj = mapAdaptiveDivergence(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (External)
    'ltm monitor external': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'external';
            if (rootObj.pathname === undefined) rootObj.pathname = 'none';

            delete rootObj.destination;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (FTP)
    'ltm monitor ftp': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            passphrase: (key, val) => ({ passphrase: buildProtectedObj(val) }),

            protocol: (key, val) => ({ mode: val }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'ftp';

            // destination
            rootObj = mapTargetAddressPort(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (HTTP)
    'ltm monitor http': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            passphrase: (key, val) => ({ passphrase: buildProtectedObj(val) }),

            receive: (key, val) => returnEmptyObjIfNone(val, { receive: unquote(val) }),

            receiveDown: (key, val) => returnEmptyObjIfNone(val, { receiveDown: unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            send: (key, val) => ({ send: val === 'none' ? '' : unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'http';
            rootObj = mapAdaptiveDivergence(rootObj);
            rootObj = mapTargetAddressPort(rootObj);
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (HTTP2)
    'ltm monitor http2': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            clientTLS: (key, val) => returnEmptyObjIfNone(val, { clientTLS: handleObjectRef(val) }),

            passphrase: (key, val) => ({ passphrase: buildProtectedObj(val) }),

            receive: (key, val) => returnEmptyObjIfNone(val, { receive: unquote(val) }),

            receiveDown: (key, val) => returnEmptyObjIfNone(val, { receiveDown: unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            send: (key, val) => ({ send: val === 'none' ? '' : unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'http2';

            // destination
            rootObj = mapTargetAddressPort(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (HTTPS)
    'ltm monitor https': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            clientTLS: (key, val) => returnEmptyObjIfNone(val, { clientTLS: handleObjectRef(val) }),

            passphrase: (key, val) => ({ passphrase: buildProtectedObj(val) }),

            receive: (key, val) => returnEmptyObjIfNone(val, { receive: unquote(val) }),

            receiveDown: (key, val) => returnEmptyObjIfNone(val, { receiveDown: unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            send: (key, val) => ({ send: val === 'none' ? '' : unquote(val) })
        },

        customHandling: (rootObj, loc, file) => {
            const newObj = {};
            rootObj.monitorType = 'https';
            if (rootObj.clientCertificate) {
                const cert = loadCertsAndKeys(rootObj.clientCertificate, loc, file);
                rootObj.clientCertificate = cert.name;
                delete rootObj.key;
            }

            rootObj = mapTargetAddressPort(rootObj);
            rootObj.upInterval = rootObj.upInterval || 0;
            rootObj.transparent = rootObj.transparent || false;
            rootObj.reverse = rootObj.reverse || false;
            rootObj = mapAdaptiveDivergence(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (ICMP)
    'ltm monitor gateway-icmp': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'icmp';

            rootObj = mapTargetAddressPort(rootObj);

            // default values (not explicit in conf)
            rootObj.upInterval = rootObj.upInterval || 0;
            rootObj.transparent = rootObj.transparent || false;
            rootObj = mapAdaptiveDivergence(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (LDAP)
    'ltm monitor ldap': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            codesUp: (key, val) => ({ filter: val }),

            passphrase: (key, val) => ({ passphrase: buildProtectedObj(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'ldap';

            // destination
            rootObj = mapTargetAddressPort(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (MYSQL)
    'ltm monitor mysql': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            passphrase: (key, val) => ({ passphrase: buildProtectedObj(val) }),

            receive: (key, val) => returnEmptyObjIfNone(val, { receive: unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            send: (key, val) => ({ send: val === 'none' ? '' : unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'mysql';

            // destination
            rootObj = mapTargetAddressPort(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (PostgreSQL)
    'ltm monitor postgresql': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            passphrase: (key, val) => ({ passphrase: buildProtectedObj(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'postgresql';
            rootObj = mapTargetAddressPort(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (RADIUS)
    'ltm monitor radius': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            passphrase: (key, val) => ({ passphrase: buildProtectedObj(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            secret: (key, val) => ({ secret: buildProtectedObj(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'radius';

            rootObj = mapTargetAddressPort(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (SIP)
    'ltm monitor sip': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        customHandling: (rootObj, loc, file) => {
            const newObj = {};
            rootObj.monitorType = 'sip';

            if (rootObj.clientCertificate) {
                const cert = loadCertsAndKeys(rootObj.clientCertificate, loc, file);
                rootObj.clientCertificate = cert.name;
                delete rootObj.key;
            }

            rootObj = mapTargetAddressPort(rootObj);
            newObj[loc.profile] = rootObj;
            return newObj;
        },

        keyValueRemaps: {
            codesUp: (key, val) => ({ codesUp: convertToNumberArray(unquote(val)) }),

            codesDown: (key, val) => ({ codesDown: convertToNumberArray(unquote(val)) }),

            headers: (key, val) => ({ headers: unquote(val).replace(/\\/g, '') }),

            request: (key, val) => ({ request: unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // Monitor (SMTP)
    'ltm monitor smtp': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'smtp';
            if (rootObj.domain === undefined) rootObj.domain = 'none';

            delete rootObj.destination;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (TCP)
    'ltm monitor tcp': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            receive: (key, val) => ({ receive: val === 'none' ? '' : unquote(val) }),

            receiveDown: (key, val) => ({ receiveDown: val === 'none' ? '' : unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            send: (key, val) => ({ send: val === 'none' ? '' : unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'tcp';

            rootObj = mapTargetAddressPort(rootObj);
            rootObj.upInterval = rootObj.upInterval || 0;
            rootObj.transparent = rootObj.transparent || false;
            rootObj.reverse = rootObj.reverse || false;
            rootObj = mapAdaptiveDivergence(rootObj);

            if (rootObj.send) rootObj.send = rootObj.send.replace(/\\r/g, '\r').replace(/\\n/g, '\n');

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (TCP-Half-Open)
    'ltm monitor tcp-half-open': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'tcp-half-open';

            rootObj = mapTargetAddressPort(rootObj);
            rootObj.upInterval = rootObj.upInterval || 0;
            rootObj.transparent = rootObj.transparent || false;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Monitor (UDP)
    'ltm monitor udp': {
        class: 'Monitor',

        lookupOverride: 'ltm monitor',

        keyValueRemaps: {
            receive: (key, val) => ({ receive: val === 'none' ? '' : unquote(val) }),

            receiveDown: (key, val) => ({ receiveDown: val === 'none' ? '' : unquote(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            send: (key, val) => ({ send: val === 'none' ? '' : unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            rootObj.monitorType = 'udp';

            rootObj = mapTargetAddressPort(rootObj);

            rootObj.upInterval = rootObj.upInterval || 0;
            rootObj.transparent = rootObj.transparent || false;
            rootObj.reverse = rootObj.reverse || false;
            rootObj = mapAdaptiveDivergence(rootObj);

            if (rootObj.send) rootObj.send = rootObj.send.replace(/\\r/g, '\r').replace(/\\n/g, '\n');

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
