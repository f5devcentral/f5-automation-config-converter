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

const buildProtectedObj = require('../../../util/convert/buildProtectedObj');
const convertToNameValueObj = require('../../../util/convert/convertToNameValueObj');
const enabledToEnable = require('../../../util/convert/enabledToEnable');
const handleObjectRef = require('../../../util/convert/handleObjectRef');
const loadCertsAndKeys = require('../../../util/convert/loadCertsAndKeys');
const returnEmptyObjIfNone = require('../../../util/convert/returnEmptyObjIfNone');
const unquote = require('../../../util/convert/unquote');

const defaults = require('../../bigipDefaults.json');

const removeChars = (str) => {
    for (let i = 0; i < str.length; i += 1) {
        const char = str[i];
        if (!/^[0-9]+$/.test(char)) {
            return parseInt(str.slice(0, i), 10);
        }
    }
    return false;
};

module.exports = {

    // Adapt_Profile (Request)
    'ltm profile request-adapt': {
        class: 'Adapt_Profile',

        keyValueRemaps: {
            internalService: (key, val) => returnEmptyObjIfNone(val, {
                internalService: handleObjectRef(val)
            }),

            serviceDownAction: (key, val) => ({ serviceDownAction: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            rootObj.messageType = 'request';

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Adapt_Profile (Response)
    'ltm profile response-adapt': {
        class: 'Adapt_Profile',

        keyValueRemaps: {
            internalService: (key, val) => returnEmptyObjIfNone(val, {
                internalService: handleObjectRef(val)
            }),

            serviceDownAction: (key, val) => ({ serviceDownAction: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            rootObj.messageType = 'response';

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Analytics_Profile
    'ltm profile analytics': {
        class: 'Analytics_Profile',

        keyValueRemaps: {
            countriesForStatCollection: (key, val) => {
                if (Array.isArray(val)) {
                    return { countriesForStatCollection: val };
                }

                // if there is an entry quoted with spaces then list not converted to array by parser
                // example from parser - "{ Ecuador "Falkland Islands (Malvinas)" }""
                val = val.match(/\w+|"[^"]+"/g);
                return { countriesForStatCollection: val.map((x) => unquote(x)) };
            },

            externalLoggingPublisher: (key, val) => returnEmptyObjIfNone(val, {
                externalLoggingPublisher: handleObjectRef(val)
            }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            rootObj.captureFilter = {};
            [
                'capturedProtocols',
                'capturedReadyForJsInjection',
                'clientIps',
                'dosActivity',
                'methods',
                'nodeAddresses',
                'requestCapturedParts',
                'requestContentFilterSearchPart',
                'requestContentFilterSearchString',
                'responseCapturedParts',
                'responseCodes',
                'responseContentFilterSearchPart',
                'responseContentFilterSearchString',
                'virtualServers',
                'urlFilterType',
                'urlPathPrefixes',
                'userAgentSubstrings'
            ]
                .forEach((value) => {
                    if (rootObj[value]) {
                        rootObj.captureFilter[value] = rootObj[value];
                        delete rootObj[value];
                    }
                });

            if (rootObj.requestCapturedParts) {
                rootObj.captureFilter = {};
                rootObj.captureFilter.requestCapturedParts = rootObj.requestCapturedParts;
                delete rootObj.requestCapturedParts;
            }
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Analytics_TCP_Profile
    'ltm profile tcp-analytics': {
        class: 'Analytics_TCP_Profile',

        keyValueRemaps: {
            externalLoggingPublisher: (key, val) => returnEmptyObjIfNone(val, {
                externalLoggingPublisher: handleObjectRef(val)
            }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // Capture_Filter (Analytics_Profile subobject)
    'ltm profile analytics traffic-capture capture-for-f5-appsvcs': {
        class: 'Capture_Filter',

        keyValueRemaps: {
            nodeAddresses: (key, val) => {
                if (typeof val === 'object') {
                    return { nodeAddresses: Object.keys(val) };
                }
                return { nodeAddresses: val };
            },

            requestContentFilterSearchString: (key, val) => ({ requestContentFilterSearchString: unquote(val) }),

            responseContentFilterSearchString: (key, val) => ({ responseContentFilterSearchString: unquote(val) }),

            userAgentSubstrings: (key, val) => {
                if (Array.isArray(val)) {
                    return { userAgentSubstrings: val };
                }

                // if there is an entry quoted with spaces then list not converted to array by parser
                // example from parser - "{ "Mozilla (01" "Mozilla (02" "Mozilla (03" }""
                val = val.match(/\w+|"[^"]+"/g);
                return { userAgentSubstrings: val.map((x) => unquote(x)) };
            },

            virtualServers: (key, val) => {
                if (typeof val === 'object') {
                    return { virtualServers: Object.keys(val) };
                }
                return { virtualServers: val };
            }
        }
    },

    // Classification_Profile
    'ltm profile classification': {
        class: 'Classification_Profile',

        keyValueRemaps: {
            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) }),

            logPublisher: (key, val) => ({ logPublisher: handleObjectRef(val) }),

            preset: (key, val) => ({ preset: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            statisticsPublisher: (key, val) => ({ statisticsPublisher: handleObjectRef(val) })
        }
    },

    // DNS_Profile
    'ltm profile dns': {
        class: 'DNS_Profile',

        keyValueRemaps: {
            cache: (key, val) => returnEmptyObjIfNone(val, { cache: { bigip: val } }),

            dns64Prefix: (key, val) => ({ dns64Prefix: val === 'any6' ? '0:0:0:0:0:0:0:0' : val }),

            loggingProfile: (key, val) => returnEmptyObjIfNone(val, { loggingProfile: { bigip: val } }),

            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            securityProfile: (key, val) => returnEmptyObjIfNone(val, { securityProfile: { bigip: val } })

        }
    },

    // L4_Profile
    'ltm profile fastl4': {
        class: 'L4_Profile',

        keyValueRemaps: {
            keepAliveInterval: (key, val) => ({ keepAliveInterval: val !== 'disabled' ? val : 0 }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // FIX_Profile
    'ltm profile fix': {
        class: 'FIX_Profile',

        keyValueRemaps: {
            fullLogonParsingEnabled: (key, val) => ({ fullLogonParsingEnabled: val === 'true' }),

            messageLogPublisher: (key, val) => returnEmptyObjIfNone(val, { messageLogPublisher: handleObjectRef(val) }),

            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) }),

            quickParsingEnabled: (key, val) => ({ quickParsingEnabled: val === 'true' }),

            remark: (key, val) => ({ remark: unquote(val) }),

            responseParsingEnabled: (key, val) => ({ responseParsingEnabled: val === 'true' }),

            reportLogPublisher: (key, val) => returnEmptyObjIfNone(val, { reportLogPublisher: handleObjectRef(val) }),

            senderTagMappingList: (key, val) => {
                if (val === 'none') return {};
                return {
                    senderTagMappingList: Object.keys(val).map((x) => ({
                        senderId: val[x]['sender-id'],
                        tagDataGroup: handleObjectRef(val[x]['tag-map-class'])
                    }))
                };
            }
        }
    },

    // FTP_Profile
    'ltm profile ftp': {
        class: 'FTP_Profile',

        keyValueRemaps: {
            allowFtps: () => ({ }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // ICAP_Profile
    'ltm profile icap': {
        class: 'ICAP_Profile',

        keyValueRemaps: {
            fromHeader: (key, val) => ({ fromHeader: unquote(val) }),

            hostHeader: (key, val) => ({ hostHeader: unquote(val) }),

            refererHeader: (key, val) => ({ refererHeader: unquote(val) }),

            userAgentHeader: (key, val) => ({ userAgentHeader: unquote(val) })
        }
    },

    // Radius_Profile
    'ltm profile radius': {
        class: 'Radius_Profile',

        keyValueRemaps: {
            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) }),

            protocolProfile: (key, val) => ({ protocolProfile: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // HTML_Profile
    'ltm profile html': {
        class: 'HTML_Profile',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            if (rootObj.rules) {
                const rules = [];
                const keys = Object.keys(rootObj.rules);
                for (let i = 0; i < keys.length; i += 1) {
                    rules.push(handleObjectRef(keys[i]));
                }

                rootObj.rules = rules;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // HTTP_Acceleration_Profile
    'ltm profile web-acceleration': {
        class: 'HTTP_Acceleration_Profile',

        keyValueRemaps: {
            cacheSize: (key, val) => ({ cacheSize: removeChars(val) }),

            metadataMaxSize: (key, val) => ({ metadataMaxSize: removeChars(val) }),

            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) })
        }
    },

    // HTTP_Compress
    'ltm profile http-compression': {
        class: 'HTTP_Compress',

        keyValueRemaps: {
            contentTypeExclude: (key, val) => ({ contentTypeExcludes: val }),

            contentTypeInclude: (key, val) => ({ contentTypeIncludes: val }),

            gzipMemory: (key, val) => ({ gzipMemory: removeChars(val) }),

            gzipWindowSize: (key, val) => ({ gzipWindowSize: removeChars(val) }),

            uriExclude: (key, val) => ({ uriExcludes: val }),

            uriInclude: (key, val) => ({ uriIncludes: val }),

            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            if (rootObj.contentTypeIncludes && rootObj.contentTypeIncludes.includes('{')) {
                const split = rootObj.contentTypeIncludes.split('"');
                rootObj.contentTypeIncludes = [split[1]];
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // HTTP_Profile
    'ltm profile http': {
        class: 'HTTP_Profile',

        prependProps: ['hsts'],

        keyValueRemaps: {
            cookiePassphrase: (key, val) => ({ cookiePassphrase: buildProtectedObj(val) }),

            encryptCookies: (key, val) => returnEmptyObjIfNone(val, { encryptCookies: val }),

            fallbackRedirect: (key, val) => returnEmptyObjIfNone(val, { fallbackRedirect: val }),

            insertHeader: (key, val) => {
                if (val === 'none') return {};
                return { insertHeader: convertToNameValueObj(val) };
            },

            remark: (key, val) => ({ remark: unquote(val) }),

            rewriteRedirects: (key, val) => ({ rewriteRedirects: (val === 'nodes' ? 'addresses' : val) }),

            serverHeaderValue: (key, val) => ({ serverHeaderValue: unquote(val) }),

            whiteOutHeader: (key, val) => returnEmptyObjIfNone(val, { whiteOutHeader: val })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};

            // HTTP_Profile Explicit
            if (rootObj.resolver) rootObj.resolver = { bigip: rootObj.resolver };
            if (rootObj.badRequestMessage) rootObj.badRequestMessage = unquote(rootObj.badRequestMessage);
            if (rootObj.badResponseMessage) rootObj.badResponseMessage = unquote(rootObj.badResponseMessage);
            if (rootObj.connectErrorMessage) rootObj.connectErrorMessage = unquote(rootObj.connectErrorMessage);
            if (rootObj.dnsErrorMessage) rootObj.dnsErrorMessage = unquote(rootObj.dnsErrorMessage);
            if (rootObj.routeDomain) rootObj.routeDomain = parseInt(rootObj.routeDomain.split('/Common/')[1], 10);

            // handle possible parser error (knownMethods should be array)
            if (rootObj.knownMethods && !Array.isArray(rootObj.knownMethods)) {
                const objKey = Object.keys(rootObj.knownMethods)[0];
                const objArr = rootObj.knownMethods[objKey].split(' ');
                objArr.unshift(objKey);
                rootObj.knownMethods = objArr;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // HTTP2_Profile
    'ltm profile http2': {
        class: 'HTTP2_Profile',

        keyValueRemaps: {
            activationMode: (key, val) => ({ activationMode: Array.isArray(val) ? val[0] : val }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // IP_Other_Profile
    'ltm profile ipother': {
        class: 'IP_Other_Profile',

        keyValueRemaps: {
            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // Multiplex_Profile
    'ltm profile one-connect': {
        class: 'Multiplex_Profile',

        keyValueRemaps: {
            idleTimeoutOverride: (key, val) => ({ idleTimeoutOverride: (val === 'disabled' ? 0 : val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            sourceMask: (key, val) => (val === 'any' ? {} : { sourceMask: val })
        }
    },

    // Traffic_Log_Profile
    'ltm profile request-log': {
        class: 'Traffic_Log_Profile',

        keyValueRemaps: {
            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) }),

            proxyResponse: (key, val) => returnEmptyObjIfNone(val, { proxyResponse: unquote(val) }),

            requestErrorPool: (key, val) => returnEmptyObjIfNone(val, { requestErrorPool: handleObjectRef(val) }),

            requestErrorProtocol: (key, val) => returnEmptyObjIfNone(val, { requestErrorProtocol: val }),

            requestErrorTemplate: (key, val) => returnEmptyObjIfNone(val, { requestErrorTemplate: unquote(val) }),

            remark: (key, val) => returnEmptyObjIfNone(val, { remark: unquote(val) }),

            requestPool: (key, val) => returnEmptyObjIfNone(val, { requestPool: handleObjectRef(val) }),

            requestProtocol: (key, val) => returnEmptyObjIfNone(val, { requestProtocol: val }),

            requestTemplate: (key, val) => returnEmptyObjIfNone(val, { requestTemplate: unquote(val) }),

            responseErrorPool: (key, val) => returnEmptyObjIfNone(val, { responseErrorPool: handleObjectRef(val) }),

            responseErrorProtocol: (key, val) => returnEmptyObjIfNone(val, { responseErrorProtocol: val }),

            responseErrorTemplate: (key, val) => returnEmptyObjIfNone(val, { responseErrorTemplate: val }),

            responsePool: (key, val) => returnEmptyObjIfNone(val, { responsePool: handleObjectRef(val) }),

            responseProtocol: (key, val) => returnEmptyObjIfNone(val, { responseProtocol: val }),

            responseTemplate: (key, val) => returnEmptyObjIfNone(val, { responseTemplate: val })
        },

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const rootKeys = Object.keys(rootObj);

            // requestSettings
            const req = {};
            const reqArr = [
                'requestErrorLoggingEnabled',
                'proxyCloseOnErrorEnabled',
                'proxyRespondOnLoggingErrorEnabled',
                'proxyResponse',
                'requestEnabled',
                'requestErrorPool',
                'requestErrorProtocol',
                'requestErrorTemplate',
                'requestPool',
                'requestProtocol',
                'requestTemplate'
            ];
            for (let i = 0; i < reqArr.length; i += 1) {
                if (rootKeys.includes(reqArr[i])) req[reqArr[i]] = rootObj[reqArr[i]];
                delete rootObj[reqArr[i]];
            }

            // responseSettings
            const res = {};
            const resArr = [
                'byDefaultEnabled',
                'responseEnabled',
                'responseErrorLoggingEnabled',
                'responseErrorPool',
                'responseErrorProtocol',
                'responseErrorTemplate',
                'responsePool',
                'responseProtocol',
                'responseTemplate'
            ];
            for (let i = 0; i < resArr.length; i += 1) {
                if (rootKeys.includes(resArr[i])) res[resArr[i]] = rootObj[resArr[i]];
                delete rootObj[resArr[i]];
            }

            rootObj.requestSettings = req;
            rootObj.responseSettings = res;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // Rewrite_Profile
    'ltm profile rewrite': {
        class: 'Rewrite_Profile',

        keyValueRemaps: {
            certificate: (key, val) => {
                if (defaults.includes(val)) return {};
                return { certificate: val.replace('.crt', '') };
            },

            defaultsFrom: () => ({}),

            javaCaFile: (key, val) => ({ javaCaFile: handleObjectRef(val) }),

            javaCrl: () => ({}),

            javaSignKey: () => ({}),

            setCookieRules: (key, val) => ({ setCookieRules: Object.keys(val).map((x) => val[x]) }),

            uriRules: (key, val) => ({ uriRules: Object.keys(val).map((x) => val[x]) })
        },

        customHandling: (rootObj, loc, file) => {
            const newObj = {};
            const orig = file[loc.original];
            const rootKeys = Object.keys(rootObj);

            // rootObj.javaSignKeyPassphrase
            const pass = orig['java-sign-key-passphrase-encrypted'];
            if (pass) {
                rootObj.javaSignKeyPassphrase = buildProtectedObj(pass);
            }

            // rootObj.requestSettings
            const req = {};

            // insertXforwardedForEnabled -> requestSettings.insertXforwardedForEnabled
            if (rootKeys.includes('insertXforwardedForEnabled')) req.insertXforwardedForEnabled = rootObj.insertXforwardedForEnabled;
            delete rootObj.insertXforwardedForEnabled;

            // insertXforwardedHostEnabled -> requestSettings.insertXforwardedHostEnabled
            if (rootKeys.includes('insertXforwardedHostEnabled')) req.insertXforwardedHostEnabled = rootObj.insertXforwardedHostEnabled;
            delete rootObj.insertXforwardedHostEnabled;

            // insertXforwardedProtoEnabled -> requestSettings.insertXforwardedProtoEnabled
            if (rootKeys.includes('insertXforwardedProtoEnabled')) req.insertXforwardedProtoEnabled = rootObj.insertXforwardedProtoEnabled;
            delete rootObj.insertXforwardedProtoEnabled;

            // rootObj.responseSettings
            const res = {};

            // rewriteContentEnabled -> responseSettings.rewriteContentEnabled
            if (rootKeys.includes('rewriteContentEnabled')) res.rewriteContentEnabled = rootObj.rewriteContentEnabled;
            delete rootObj.rewriteContentEnabled;

            // the rewriteHeadersEnabled option exists for both req and res, however one is being overwritten
            if (orig.request) req.rewriteHeadersEnabled = orig.request['rewrite-headers'] === 'enabled';
            if (orig.response) res.rewriteHeadersEnabled = orig.response['rewrite-headers'] === 'enabled';
            delete rootObj.rewriteHeadersEnabled;

            if (Object.keys(req).length) rootObj.requestSettings = req;
            if (Object.keys(res).length) rootObj.responseSettings = res;

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // SIP_Profile
    'ltm profile sip': {
        class: 'SIP_Profile',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        }
    },

    // Stream_Profile
    'ltm profile stream': {
        class: 'Stream_Profile',

        keyValueRemaps: {
            parentProfile: (key, val) => ({ parentProfile: handleObjectRef(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            source: (key, val) => ({ source: unquote(val) }),

            target: (key, val) => ({ target: unquote(val) })
        }

    },

    // TCP_Profile
    'ltm profile tcp': {
        class: 'TCP_Profile',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            if (rootObj.tcpOptions) {
                rootObj.tcpOptions = unquote(rootObj.tcpOptions);
                let split = rootObj.tcpOptions.match(/{.+?}/g);
                split = split.map((x) => x.replace('{', '').replace('}', ''));
                const newOptions = [];
                split.forEach((value) => {
                    const newOption = {};
                    if (value.includes('first')) {
                        value = value.replace('first', '');
                        newOption.when = 'first';
                        newOption.option = parseInt(value, 10);
                        newOptions.push(newOption);
                    } else if (value.includes('last')) {
                        value = value.replace('last', '');
                        newOption.when = 'last';
                        newOption.option = parseInt(value, 10);
                        newOptions.push(newOption);
                    }
                });
                rootObj.tcpOptions = newOptions;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        },

        keyValueRemaps: {
            closeWaitTimeout: (key, val) => ({ closeWaitTimeout: val === 4294967295 ? -1 : val }),

            finWaitTimeout: (key, val) => ({ finWaitTimeout: val === 4294967295 ? -1 : val }),

            finWait2Timeout: (key, val) => ({ finWait2Timeout: val === 4294967295 ? -1 : val }),

            idleTimeout: (key, val) => ({ idleTimeout: val === 4294967295 ? -1 : val }),

            md5SignaturePassphrase: (key, val) => returnEmptyObjIfNone(
                val,
                { md5SignaturePassphrase: buildProtectedObj(val) }
            ),

            mptcp: (key, val) => ({ mptcp: enabledToEnable(val) }),

            nagle: (key, val) => ({ nagle: enabledToEnable(val) }),

            remark: (key, val) => ({ remark: unquote(val) }),

            tcpOptions: (key, val) => returnEmptyObjIfNone(val, { tcpOptions: val }),

            timeWaitTimeout: (key, val) => ({ timeWaitTimeout: val === 'indefinite' ? -1 : val }),

            zeroWindowTimeout: (key, val) => ({ zeroWindowTimeout: val === 4294967295 ? -1 : val })
        }
    },

    // TLS_Client
    'ltm profile server-ssl': {
        class: 'TLS_Client',

        customHandling: (rootObj, loc, file) => {
            const newObj = {};

            if (rootObj.clientCertificate === '/Common/default.crt') {
                newObj.certificate_default = {
                    class: 'Certificate',
                    certificate: { bigip: '/Common/default.crt' },
                    privateKey: { bigip: '/Common/default.key' }
                };
                rootObj.clientCertificate = 'certificate_default';
            } else if (rootObj.clientCertificate && rootObj.clientCertificate !== 'none') {
                if (rootObj.clientCertificate.split('/').length === 3) {
                    const certName = rootObj.clientCertificate.split('/')[2].replace('.crt', '');
                    const rootObjKeys = Object.keys(rootObj);
                    newObj[certName] = { class: 'Certificate' };

                    if (rootObjKeys.includes('clientCertificate')) newObj[certName].certificate = { bigip: rootObj.clientCertificate };
                    if (rootObjKeys.includes('chain') && rootObj.chain !== 'none') newObj[certName].chainCA = { bigip: rootObj.chain };
                    if (rootObjKeys.includes('key')) newObj[certName].privateKey = { bigip: rootObj.key };
                    if (rootObjKeys.includes('passphrase')) newObj[certName].passphrase = buildProtectedObj(rootObj.passphrase);
                }

                const cert = loadCertsAndKeys(rootObj.clientCertificate, loc, file);
                rootObj.clientCertificate = cert.name;
            }

            if (rootObj.clientCertificate === 'none') {
                delete rootObj.clientCertificate;
            }

            if (rootObj.ciphers === 'none' && rootObj.cipherGroup) {
                delete rootObj.ciphers;
            }

            delete rootObj.chain;
            delete rootObj.key;
            delete rootObj.passphrase;

            // Check different options enabled
            rootObj.tls1_0Enabled = !!((rootObj.options && !rootObj.options.includes('no-tlsv1')) || !rootObj.options);
            rootObj.tls1_1Enabled = !!((rootObj.options && !rootObj.options.includes('no-tlsv1.1')) || !rootObj.options);
            rootObj.tls1_2Enabled = !!((rootObj.options && !rootObj.options.includes('no-tlsv1.2')) || !rootObj.options);
            rootObj.tls1_3Enabled = !!(((rootObj.options && !rootObj.options.includes('no-tlsv1.3')) || !rootObj.options) && rootObj.cipherGroup);
            rootObj.singleUseDhEnabled = !!(rootObj.options && rootObj.options.includes('single-dh-use'));
            rootObj.insertEmptyFragmentsEnabled = !!((rootObj.options && !rootObj.options.includes('dont-insert-empty-fragments')) || !rootObj.options);
            delete rootObj.options;

            newObj[loc.profile] = rootObj;
            return newObj;
        },

        keyValueRemaps: {
            authenticationFrequency: (key, val) => ({ authenticationFrequency: val === 'once' ? 'one-time' : 'every-time' }),

            c3dCACertificate: (key, val) => returnEmptyObjIfNone(val, { c3dCACertificate: val }),

            c3dCAKey: (key, val) => returnEmptyObjIfNone(val, { c3dCAKey: val }),

            crlFile: (key, val) => returnEmptyObjIfNone(val, { crlFile: val }),

            remark: (key, val) => ({ remark: unquote(val) }),

            trustCA: (key, val) => returnEmptyObjIfNone(val, { trustCA: val === '/Common/ca-bundle.crt' ? 'generic' : { use: val } }),

            cipherGroup: (key, val) => returnEmptyObjIfNone(val, { cipherGroup: handleObjectRef(val) })
        }
    },

    // TLS_Server
    'ltm profile client-ssl': {
        class: 'TLS_Server',

        customHandling: (rootObj, loc) => {
            const newObj = {};
            const certificates = [];

            const certKeys = Object.keys(rootObj.certificates);
            for (let i = 0; i < certKeys.length; i += 1) {
                const certKey = certKeys[i];
                const certConf = rootObj.certificates[certKey];

                // handle cert ref
                let certRef = certConf.cert;
                let obj = {};
                if (certRef.includes('default.crt')) {
                    obj = { certificate: 'certificate_default' };
                    newObj.certificate_default = {
                        class: 'Certificate',
                        certificate: { bigip: '/Common/default.crt' },
                        privateKey: { bigip: '/Common/default.key' }
                    };
                } else {
                    if (!defaults.includes(certConf.cert)) {
                        if (certRef.split('/').length === 3) {
                            const certName = certRef.split('/')[2].replace('.crt', '');

                            // Certificate class will end up in partition even if tmsh cert originally not
                            certRef = certRef.replace('/Common', `/${loc.tenant}/${loc.app}`);

                            const certConfKeys = Object.keys(certConf);
                            newObj[certName] = { class: 'Certificate' };

                            if (certConfKeys.includes('cert')) newObj[certName].certificate = { bigip: certConf.cert };
                            if (certConfKeys.includes('chain')) newObj[certName].chainCA = { bigip: certConf.chain };
                            if (certConfKeys.includes('key')) newObj[certName].privateKey = { bigip: certConf.key };
                            if (certConfKeys.includes('passphrase')) newObj[certName].passphrase = buildProtectedObj(certConf.passphrase);
                        }
                        certRef = certRef.replace('.crt', '');
                    }
                    obj = { certificate: certRef };
                }
                if (rootObj.matchToSNI && rootObj.matchToSNI !== 'none') obj.matchToSNI = rootObj.matchToSNI;
                certificates.push(obj);
            }

            if (rootObj.ciphers === 'none' && rootObj.cipherGroup) {
                delete rootObj.ciphers;
            }

            // Check different options enabled
            rootObj.tls1_0Enabled = !!((rootObj.options && !rootObj.options.includes('no-tlsv1')) || !rootObj.options);
            rootObj.tls1_1Enabled = !!((rootObj.options && !rootObj.options.includes('no-tlsv1.1')) || !rootObj.options);
            rootObj.tls1_2Enabled = !!((rootObj.options && !rootObj.options.includes('no-tlsv1.2')) || !rootObj.options);
            rootObj.tls1_3Enabled = !!(((rootObj.options && !rootObj.options.includes('no-tlsv1.3')) || !rootObj.options) && rootObj.cipherGroup);
            rootObj.singleUseDhEnabled = !!(rootObj.options && rootObj.options.includes('single-dh-use'));
            rootObj.insertEmptyFragmentsEnabled = !!((rootObj.options && !rootObj.options.includes('dont-insert-empty-fragments')) || !rootObj.options);
            delete rootObj.options;

            delete rootObj.matchToSNI;
            rootObj.certificates = certificates;
            newObj[loc.profile] = rootObj;
            return newObj;
        },

        keyValueRemaps: {
            authenticationFrequency: (key, val) => ({ authenticationFrequency: val === 'once' ? 'one-time' : 'every-time' }),

            authenticationInviteCA: (key, val) => {
                if (val === 'none') return {};
                return { authenticationInviteCA: handleObjectRef(val) };
            },

            authenticationTrustCA: (key, val) => {
                if (val === 'none') return {};
                return { authenticationTrustCA: handleObjectRef(val) };
            },

            c3dOCSP: (key, val) => returnEmptyObjIfNone(val, { c3dOCSP: val }),

            proxyCaCert: () => ({}),

            proxyCaKey: () => ({}),

            proxyCaPassphrase: () => ({}),

            cipherGroup: (key, val) => returnEmptyObjIfNone(val, { cipherGroup: handleObjectRef(val) }),

            crlFile: (key, val) => returnEmptyObjIfNone(val, { crlFile: val }),

            enabled: () => ({}),

            forwardProxyBypassAllowlist: (key, val) => returnEmptyObjIfNone(
                val,
                { forwardProxyBypassAllowlist: handleObjectRef(val) }
            ),

            remark: (key, val) => ({ remark: unquote(val) }),

            sniDefault: () => ({})
        }
    },

    // UDP_Profile
    'ltm profile udp': {
        class: 'UDP_Profile',

        keyValueRemaps: {
            idleTimeout: (key, val) => ({ idleTimeout: val === 'indefinite' ? -1 : val }),

            remark: (key, val) => ({ remark: unquote(val) })
        }
    }
};
