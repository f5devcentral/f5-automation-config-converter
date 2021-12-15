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

const AJV = require('ajv');
const crypto = require('crypto');

const secureVault = require('@f5devcentral/atg-shared-utilities').secureVault;
const log = require('./log');
const util = require('./util/util');

const DEVICE_TYPES = require('./constants').DEVICE_TYPES;

function replaceCipher(data, secret, JOSE) {
    // replace ciphertext with cryptogram
    if ((typeof Buffer.from === 'function')
        && (Buffer.from !== Uint8Array.from)) {
        data.ciphertext = Buffer
            .from(secret)
            .toString('base64')
            .replace(/[+]/g, '-')
            .replace(/\x2f/g, '_');
    } else {
        /* eslint-disable-next-line no-buffer-constructor */
        data.ciphertext = new Buffer(secret)
            .toString('base64')
            .replace(/[+]/g, '-')
            .replace(/\x2f/g, '_');
    }
    // update JOSE header
    if ((typeof Buffer.from === 'function')
        && (Buffer.from !== Uint8Array.from)) {
        data.protected = Buffer
            .from(JSON.stringify(JOSE))
            .toString('base64')
            .replace(/[+]/g, '-')
            .replace(/\x2f/g, '_');
    } else {
        /* eslint-disable-next-line no-buffer-constructor */
        data.protected = new Buffer(JSON.stringify(JOSE))
            .toString('base64')
            .replace(/[+]/g, '-')
            .replace(/\x2f/g, '_');
    }
    data.miniJWE = true;
}

function encryptSecret(context, secret, dataPath) {
    // when 'mySchema' === true, want to bind secret to config object
    if (!secret
        || !Object.prototype.hasOwnProperty.call(secret, 'protected')
        || !Object.prototype.hasOwnProperty.call(secret, 'ciphertext')) {
        // 'secret' is not a JWE, so we're done
        return Promise.resolve(secret);
    }

    // decode "protected" to find out if ciphertext is already encrypted
    const joseString = util.fromBase64(secret.protected).toString();
    let JOSE;
    try {
        JOSE = JSON.parse(joseString);
    } catch (e) {
        const myerror = {
            dataPath: dataPath || 'unknown path',
            keyword: 'f5secret',
            params: {},
            message: `Error parsing 'protected' property: ${e.message}`
        };
        throw new AJV.ValidationError([myerror]);
    }
    if (!Object.prototype.hasOwnProperty.call(JOSE, 'enc') || (JOSE.enc !== 'none')) {
        // ciphertext is already encrypted
        return Promise.resolve();
    }

    const plainTextSecret = util.fromBase64(secret.ciphertext).toString();

    if (util.getDeepValue(context, 'target.deviceType') === DEVICE_TYPES.BIG_IQ) {
        // secret encrypted on BIG-IQ is not readable on BIG-IP,
        // so a special BIG-IQ service is used to store it
        JOSE.enc = 'f5biq';

        const baseUrl = '/mgmt/cm/system/simple-encrypter';

        const postOptions = {
            path: baseUrl,
            method: 'POST',
            send: `{"inputText":"${plainTextSecret}"}`
        };

        return util.iControlRequest(context, postOptions)
            .then((resp) => {
                if (typeof resp.encryptedText !== 'string') {
                    log.error('f5secret: encryption failed');
                    return;
                }
                replaceCipher(secret, resp.encryptedText, JOSE);
            });
        // end of handling for BIG-IQ
    }
    // BIG-IP does not yet offer a straightforward API
    // to create a SecureVault cryptogram.  We use a
    // workaround:  create a new RADIUS server component,
    // setting the RADIUS secret to S.  TMOS will encrypt
    // S to SecureVault immediately and iControl REST
    // will give us back the SV cryptogram ($M$foo).
    // We then delete the bogus RADIUS server.
    JOSE.enc = 'f5sv';

    const baseUrl = '/mgmt/tm/ltm/auth/radius-server/';
    const radiusName = `__as3_Delete-Me-${crypto.randomBytes(6)
        .toString('base64')
        .replace(/[+]/g, '-')
        .replace(/\x2f/g, '_')}`;

    const postOptions = {
        path: baseUrl,
        method: 'POST',
        send: JSON.stringify({
            name: radiusName,
            secret: plainTextSecret,
            server: '__as3'
        })
    };

    const delOptions = {
        path: (baseUrl + radiusName),
        method: 'DELETE',
        crude: true
    };

    return util.iControlRequest(context, postOptions)
        .then((radius) => {
            const tmshCmd = `tmsh -a list auth radius-server ${radiusName} secret`;
            const promise = util.executeBashCommand(context, tmshCmd)
                .then((result) => {
                    radius.secret = result.split('\n')[1].trim().split(' ', 2)[1];
                    replaceCipher(secret, radius.secret, JOSE);
                })
                .then(() => radius);
            return promise;
        })
        .then((radius) => {
            if ((typeof radius.secret !== 'string') || (radius.secret.indexOf('$M$') !== 0)) {
                // log problem but leave declaration alone
                log.error('f5secret: encryption failed');
                return Promise.resolve();
            }
            return util.iControlRequest(context, delOptions);
        })
        .catch((e) => {
            // clean up any leftover component (discard async result here)
            util.iControlRequest(context, delOptions)
                .then(() => {})
                .catch((e1) => {
                    log.error(`Error occured in secret encryption: ${e1.message}`);
                });
            throw e;
        });
}

function encryptLongSecret(context, data) {
    return secureVault.encrypt(data.secret)
        .then((response) => {
            data.parent[data.key] = response;
        })
        .catch((e) => {
            e.message = `Failed encrypting credential with secureVault: ${e.message}`;
            throw e;
        });
}

function handleSecrets(context, secrets) {
    return Promise.all(secrets.map((s) => encryptSecret(context, s[0], s[1])));
}

function handleLongSecrets(context, secrets) {
    return Promise.all(secrets.map((s) => encryptLongSecret(context, s)));
}

module.exports = {
    handleSecrets,
    handleLongSecrets
};
