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
const loadCertsAndKeys = require('../../../util/convert/loadCertsAndKeys');

module.exports = {

    // Certificate and CA_Bundle
    'sys file ssl-cert': {
        class: 'UNCERTAIN_CERT',

        customHandling: (rootObj, loc, file) => {
            const newObj = {};

            const split = loc.original.split(' ');
            const path = split.at(-1);

            // skip certificates from /Common/
            if (path.startsWith('/Common/') && path.split('/').length === 3) return {};

            const cert = loadCertsAndKeys(path, loc, file);

            // only create declaration for certificate itself
            if (loc.original.includes('-bundle')) return {};

            // CA_Bundle
            if (cert && cert.value && cert.value.split('BEGIN CERTIFICATE').length > 2) {
                rootObj.class = 'CA_Bundle';
                rootObj.bundle = cert.value;
            } else {
                // Certificate
                rootObj.class = 'Certificate';
                const bundlePath = path.replace('.crt', '-bundle.crt');
                const bundle = loadCertsAndKeys(bundlePath, loc, file);
                const keyPath = path.replace('.crt', '.key');
                const key = loadCertsAndKeys(keyPath, loc, file);

                rootObj.certificate = cert.value;
                rootObj.privateKey = key.value;
                if (bundle && bundle.value) rootObj.chainCA = bundle.value;

                const sslKey = file[`sys file ssl-key ${keyPath}`];
                if (sslKey && sslKey.passphrase) {
                    rootObj.passphrase = buildProtectedObj(sslKey.passphrase);
                }
            }
            delete rootObj.sourcePath;
            newObj[cert.name] = rootObj;
            return newObj;
        }
    },

    // Certificate
    'sys file ssl-key': {
        noDirectMap: true
    },

    // Certificate_Validator_OCSP
    'ltm profile ocsp-stapling-params': {
        class: 'Certificate_Validator_OCSP',

        customHandling: (rootObj, loc, file) => {
            const newObj = {};
            const orig = file[loc.original];

            if (orig['dns-resolver']) rootObj.dnsResolver = { bigip: orig['dns-resolver'] };
            if (orig['responder-url']) rootObj.responderUrl = orig['responder-url'];
            if (orig.timeout) rootObj.timeout = parseInt(orig.timeout, 10);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Certificate_Validator_OCSP
    'sys crypto cert-validator ocsp': {
        noDirectMap: true
    }
};
