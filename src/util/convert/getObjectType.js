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

const defaults = require('../../lib/bigipDefaults.json');

// currently only supports ltm
module.exports = (objName, file) => {
    // default profiles not stored in conf
    const dict = {
        '/Common/apm-forwarding-fastL4': 'fastl4',
        '/Common/bot-defense': 'bot-defense',
        '/Common/classification_pem': 'classification',

        '/Common/clientssl': 'client-ssl',
        '/Common/clientssl-insecure-compatible': 'client-ssl',
        '/Common/clientssl-secure': 'client-ssl',
        '/Common/crypto-server-default-clientssl': 'client-ssl',
        '/Common/splitsession-default-clientssl': 'client-ssl',
        '/Common/wom-default-clientssl': 'client-ssl',

        '/Common/apm-default-serverssl': 'server-ssl',
        '/Common/crypto-client-default-serverssl': 'server-ssl',
        '/Common/pcoip-default-serverssl': 'server-ssl',
        '/Common/serverssl': 'server-ssl',
        '/Common/serverssl-insecure-compatible': 'server-ssl',
        '/Common/serverssl-secure': 'server-ssl',
        '/Common/splitsession-default-serverssl': 'server-ssl',
        '/Common/wom-default-serverssl': 'server-ssl',

        '/Common/diameter-endpoint': 'diameter-endpoint',
        '/Common/dns': 'dns',
        '/Common/dos': 'dos',
        '/Common/f5-tcp-progressive': 'tcp',
        '/Common/f5-tcp-mobile': 'tcp',
        '/Common/fastL4': 'fastl4',
        '/Common/fix': 'fix',
        '/Common/ftp': 'ftp',
        '/Common/html': 'html',
        '/Common/http': 'http',
        '/Common/httpcompression': 'http-compression',
        '/Common/httprouter': 'httprouter',
        '/Common/ipother': 'ipother',
        '/Common/mptcp-mobile-optimized': 'tcp',
        '/Common/ntlm': 'ntlm',
        '/Common/oneconnect': 'one-connect',
        '/Common/optimized-caching': 'web-acceleration',
        '/Common/radiusLB': 'radius',
        '/Common/request-adapt': 'request-adapt',
        '/Common/request-log': 'request-log',
        '/Common/response-adapt': 'response-adapt',
        '/Common/rewrite': 'rewrite',
        '/Common/spm': 'spm',
        '/Common/stream': 'stream',
        '/Common/subscriber-mgmt': 'subscriber-mgmt',
        '/Common/tcp': 'tcp',
        '/Common/udp': 'udp',
        '/Common/wan-optimized-compression': 'http-compression',
        '/Common/webacceleration': 'web-acceleration',
        '/Common/websocket': 'websocket'
    };
    if (Object.keys(dict).includes(objName)) return dict[objName];

    // fix for un-prefixed profiles on /Common 16.1
    const keys = Object.keys(file).map((key) => {
        const split = key.split(' ');
        split[split.length - 1] = !split[split.length - 1].includes('/')
            ? `/Common/${split[split.length - 1]}`
            : split[split.length - 1];
        return split.join(' ');
    });

    for (let i = 0; i < keys.length; i += 1) {
        const ltmOrPem = keys[i].startsWith('ltm ') || keys[i].startsWith('pem ');
        if (keys[i].endsWith(` ${objName}`) && !defaults.includes(objName)) {
            if (ltmOrPem) {
                return keys[i].split(' ')[2];
            }
            if (keys[i].startsWith('security')) {
                return keys[i].split(' ')[1];
            }
        }
    }
    return false;
};
