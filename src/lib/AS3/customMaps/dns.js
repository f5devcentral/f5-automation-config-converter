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
const handleObjectRef = require('../../../util/convert/handleObjectRef');
const unquote = require('../../../util/convert/unquote');

module.exports = {

    // DNS_TSIG_Key
    'ltm dns tsig-key': {
        class: 'DNS_TSIG_Key',

        keyValueRemaps: {
            secret: (key, val) => ({ secret: buildProtectedObj(val) })
        }
    },

    // DNS_Nameserver
    'ltm dns nameserver': {
        class: 'DNS_Nameserver',

        keyValueRemaps: {
            routeDomain: () => ({}),

            tsigKey: (key, val) => ({ tsigKey: handleObjectRef(val) })
        }
    },

    // DNS_Zone
    'ltm dns zone': {
        class: 'DNS_Zone',

        keyValueRemaps: {
            serverTsigKey: (key, val) => ({ serverTsigKey: handleObjectRef(val) }),

            transferClients: (key, val) => ({ transferClients: Object.keys(val).map((x) => handleObjectRef(x)) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // manually remap dnsExpress
            const dns = {};

            // dnsExpressAllowNotify -> dnsExpress.allowNotifyFrom
            if (rootObj.dnsExpressAllowNotify) dns.allowNotifyFrom = rootObj.dnsExpressAllowNotify;
            delete rootObj.dnsExpressAllowNotify;

            // dnsExpressEnabled -> dnsExpress.enabled
            if (Object.keys(rootObj).includes('dnsExpressEnabled')) dns.enabled = rootObj.dnsExpressEnabled;
            delete rootObj.dnsExpressEnabled;

            // dnsExpressNotifyTsigVerify -> dnsExpress.verifyNotifyTsig
            if (Object.keys(rootObj).includes('dnsExpressNotifyTsigVerify')) dns.verifyNotifyTsig = rootObj.dnsExpressNotifyTsigVerify;
            delete rootObj.dnsExpressNotifyTsigVerify;

            // dnsExpressNotifyAction -> dnsExpress.notifyAction
            if (rootObj.dnsExpressNotifyAction) dns.notifyAction = rootObj.dnsExpressNotifyAction;
            delete rootObj.dnsExpressNotifyAction;

            // dnsExpressServer -> dnsExpress.nameserver
            if (rootObj.dnsExpressServer) dns.nameserver = handleObjectRef(rootObj.dnsExpressServer);
            delete rootObj.dnsExpressServer;

            // attach to rootObj
            if (Object.keys(dns).length) rootObj.dnsExpress = dns;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // DNS_Cache
    'ltm dns cache transparent': {
        class: 'DNS_Cache',

        keyValueRemaps: {
            localZones: (key, val) => ({
                localZones: Object.assign(...Object.keys(val).map((z) => ({
                    [val[z].name]: {
                        type: 'transparent',
                        records: (val[z].records || '')
                            .replace('{', '').replace('}', '').trim()
                            .split(' "')
                            .map((x) => x.replace(/"/g, ''))
                            .filter((x) => x)
                    }
                })))
            }),

            messageCacheSize: (key, val) => ({ messageCacheSize: parseInt(val, 10) }),

            recordCacheSize: (key, val) => ({ recordCacheSize: parseInt(val, 10) }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            rootObj.type = 'transparent';

            const newObj = {};
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
