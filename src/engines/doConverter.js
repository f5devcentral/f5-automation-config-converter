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

/* eslint-disable consistent-return */

const configItems = require('../../autotoolDeps/DO/src/lib/configItems.json');
const customMaps = require('../lib/DO/doCustomMaps');
const log = require('../util/log');
const declarationBase = require('../util/convert/declarationBase');
const loadDeviceCert = require('../util/convert/loadDeviceCert');
const readFiles = require('../preConverter/readFiles');
const unquote = require('../util/convert/unquote');

const regexIPv4 = /^(\d{1,3}\.){3}\d{1,3}/;
const regexIPv6 = /^([a-fA-F\d]*:)+[a-fA-F\d]*/;

const camelize = (s) => s.replace(/-./g, (x) => x.toUpperCase()[1]);

const getRegKey = () => {
    try {
        const license = readFiles.data['config/bigip.license'];
        return /Registration Key :\s+([\w-]+)\n/g.exec(license)[1];
    } catch (e) {
        return false;
    }
};

/* Determine if device uses any of selfIp from list.
    Return true or false.
  */
const validateDevice = (deviceObj, selfIpList) => Boolean(selfIpList.find((selfIP) => {
    if (deviceObj.mirrorIp && deviceObj.mirrorIp === selfIP) return true;
    if (deviceObj.configsyncIp && deviceObj.configsyncIp === selfIP) return true;
    if (deviceObj.unicastAddress) {
        if (Object.keys(deviceObj.unicastAddress).find(
            (i) => Object.keys(deviceObj.unicastAddress[i]).find(
                (j) => deviceObj.unicastAddress[i][j] === selfIP
            )
        )) return true;
    }
    return false;
}));

module.exports = (json, config) => {
    const declaration = declarationBase.DO(config);

    // convert kebab-case property names into camelCase (one-level deep)
    const confObj = {};
    let currentDevice = '';
    Object.keys(json).forEach((key) => {
        confObj[key] = {};
        const tmshObj = json[key];
        Object.keys(tmshObj).forEach((propName) => {
            const newName = camelize(propName);
            confObj[key][newName] = json[key][propName];
        });
    });

    // filter devices if more than 1 in config
    const deviceKeys = Object.keys(confObj).filter((item) => item.startsWith('cm device '));
    if (deviceKeys.length > 1) {
        const selfKeys = Object.keys(confObj).filter((item) => item.startsWith('net self '));

        // collect all self addresses
        const selfAddresses = [];
        selfKeys.forEach((key) => {
            const address = confObj[key].address;
            const tmpV4 = regexIPv4.exec(address);
            const tmpV6 = regexIPv6.exec(address);

            if (tmpV4) {
                selfAddresses.push(tmpV4[0]);
            } else if (tmpV6) {
                selfAddresses.push(tmpV6[0]);
            } else {
                log.warn(`SelfIp address not defined: ${address}`);
            }
        });

        if (selfAddresses.length) {
            // go through each device and check if it contain any of self ip addresses
            deviceKeys.forEach((key) => {
                const device = confObj[key];
                if (validateDevice(device, selfAddresses)) {
                    currentDevice = device.hostname;
                } else {
                    delete confObj[key];
                }
            });
        } else {
            log.warn('No SelfIP assigned to device. Unable to clean up devices');
        }
    } else if (deviceKeys[0]) {
        currentDevice = confObj[deviceKeys[0]].hostname;
    }

    Object.keys(confObj).forEach((key) => {
        const keyArr = key.split(' ');
        const name = keyArr[keyArr.length - 1].replace('/Common/', '');

        configItems.forEach((item) => {
            // this ensures no broken conversion while DO-feature is WIP
            if (!Object.keys(customMaps).includes(item.schemaClass)) return;

            // use configItem.ignore to skip defaults
            if (item.ignore && item.ignore.filter((i) => i.name).map((n) => n.name
                .replace('^', '')
                .replace('$', ''))
                .includes(name)) return;

            if (!item.path) return;

            let tmshCmd = item.path.split('/').splice(2).join(' ');

            if (tmshCmd.includes(key) && customMaps[item.schemaClass].reduceTmshPath) {
                // override for objects where configItems.json path is overly specific
                tmshCmd = tmshCmd.split(' ').slice(0, -1).join(' ');
            }

            // Exclude convert RouteDomain to Route class instead
            // Exclude convert self-allow to SelfIp class
            if (key.startsWith('net route-domain') || key.startsWith('net self')) tmshCmd += ' ';

            if (key.includes(tmshCmd)
                 || (key.startsWith('cm device /Common/') && tmshCmd.startsWith('cm device ~Common~'))) {
                const schemaClass = item.schemaClass;

                // create DO object in declaration if it doesnt exist
                let className = schemaClass;
                if (customMaps[schemaClass] && customMaps[schemaClass].namedClass) {
                    // check if object name starts with ip address and use postfix
                    // use specific name for SelfIPs
                    const tmpV4 = regexIPv4.exec(name);
                    const tmpV6 = regexIPv6.exec(name);
                    if (tmpV4) {
                        const exst = schemaClass === 'SelfIp' ? `_${tmpV4[0].replace(/\./g, '_')}` : '';
                        className = `${schemaClass}${exst}_IPv4`;
                    } else if (tmpV6) {
                        const exst = schemaClass === 'SelfIp' ? `_${tmpV6[0].replace(/:/g, '_')}` : '';
                        className = `${schemaClass}${exst}_IPv6`;
                    } else if (key.startsWith('cm device /Common/')) {
                        className = `${schemaClass}__${name.replace(/\./g, '_')}`;
                    } else if (schemaClass === 'SelfIp') {
                        className = `${schemaClass}_${name}`;
                    } else {
                        className = name;
                    }
                }

                declaration.Common[className] = { class: schemaClass, ...declaration.Common[className] };
                log.debug(`Converting ${schemaClass} "${className}"`);

                // add properties and overrides for each obj
                item.properties
                    .concat(customMaps[schemaClass].properties || [])
                    .forEach((propObj) => {
                        let newId = propObj.newId || propObj.id;
                        let propVal = confObj[key][propObj.id];

                        if (typeof propVal !== 'undefined') {
                            // multiple tmsh objects w/ one value map to one DO obj
                            if (item.singleValue) {
                                newId = keyArr[keyArr.length - 1];
                            }

                            // handle basic coercion of DO values
                            if (propObj.truth === propVal || propVal === 'true') propVal = true;
                            if (propObj.falsehood === propVal || propVal === 'false') propVal = false;
                            if (!Array.isArray(propVal) && Number.isInteger(parseInt(propVal, 10))
                                && !propVal.includes('.') && !propVal.includes(':')) propVal = parseInt(propVal, 10);
                            if (typeof propVal === 'string') propVal = unquote(propVal);

                            // supported classes: keyValueRemaps
                            const { keyValueRemaps } = customMaps[schemaClass];
                            if (keyValueRemaps && keyValueRemaps[newId]) {
                                // merge object because property key may have changes
                                return Object.assign(
                                    declaration.Common[className],
                                    keyValueRemaps[newId](propVal, confObj[key])
                                );
                            }

                            // add property to declaration (no keyValueRemap required)
                            const newObj = {};
                            newObj[newId] = propVal;
                            return Object.assign(declaration.Common[className], newObj);
                        }
                    });

                // customPostHandling equivalent
                if (customMaps[schemaClass].customHandling) {
                    const tmp = declaration.Common[className];
                    delete declaration.Common[className];

                    const customObjs = customMaps[schemaClass].customHandling(tmp, className, name, currentDevice);
                    Object.assign(declaration.Common, customObjs);
                }

                // SNMP and HA classes specific: remove empty stanzas
                const classArr = ['TrafficGroup', 'Route', 'SnmpAgent', 'SnmpTrapEvents',
                    'ConfigSync', 'FailoverUnicast', 'FailoverMulticast', 'MirrorIp'];
                if (declaration.Common[className]
                    && Object.keys(declaration.Common[className]).length === 1
                    && classArr.find((c) => declaration.Common[className].class.includes(c))) {
                    delete declaration.Common[className];
                }
            }
        });

        // User: custom handling, not in configItems
        if (key.includes('auth user')) {
            const userObj = {
                class: 'User',
                shell: confObj[key].shell,
                userType: name === 'root' ? 'root' : 'regular'
            };
            if (name !== 'root') {
                userObj.partitionAccess = confObj[key].partitionAccess;
            }
            declaration.Common[name] = userObj;
        }

        // working with auth objects
        if (!declaration.Common.Authentication) {
            declaration.Common.Authentication = {
                class: 'Authentication'
            };
        }
        if (key.includes('auth source')) {
            const sourceObj = declaration.Common.source;
            delete sourceObj.type;
            Object.assign(declaration.Common.Authentication, sourceObj);
            delete declaration.Common.source;
        }
        if (key.includes('auth remote-user')) {
            const remoteUserObj = declaration.Common['remote-user'];
            delete remoteUserObj.class;
            declaration.Common.Authentication.remoteUsersDefaults = remoteUserObj;
            delete declaration.Common['remote-user'];
        }
        if (key.startsWith('auth ldap')) {
            const ldapName = key.split('/').pop();
            const ldapObj = declaration.Common[ldapName];
            if (ldapObj.bindPassword) ldapObj.bindPassword = '';
            delete ldapObj.class;
            if (ldapObj.sslCiphers) ldapObj.sslCiphers = ldapObj.sslCiphers.split(':');
            declaration.Common.Authentication.ldap = ldapObj;
            delete declaration.Common[ldapName];
        }
        if (key.startsWith('auth tacacs')) {
            const tacacsName = key.split('/').pop();
            const tacacsObj = declaration.Common[tacacsName];
            if (tacacsObj.secret) tacacsObj.secret = '';
            delete tacacsObj.class;
            declaration.Common.Authentication.tacacs = tacacsObj;
            delete declaration.Common[tacacsName];
        }
        if (key.startsWith('auth radius ')) {
            const tmpRadius = confObj[key];
            if (tmpRadius.servers) {
                Object.keys(tmpRadius.servers).forEach((serverFullName) => {
                    const keyServerName = `auth radius-server ${serverFullName}`;
                    if (confObj[keyServerName]) {
                        if (confObj[keyServerName].secret) confObj[keyServerName].secret = '';
                        if (!tmpRadius.servers.primary) {
                            tmpRadius.servers.primary = confObj[keyServerName];
                        } else {
                            tmpRadius.servers.secondary = confObj[keyServerName];
                        }
                        delete tmpRadius.servers[serverFullName];
                    }
                });
            }
            declaration.Common.Authentication.radius = tmpRadius;
            delete declaration.Common[key.split('/').pop()];
        }
        if (key.startsWith('auth radius-server')) {
            delete declaration.Common[key.split('/').pop()];
        }
    });

    // Delete temp Auth object
    if (Object.keys(declaration.Common.Authentication).length === 1) delete declaration.Common.Authentication;

    // DeviceCertificate: custom handing, not in configItems
    const certData = loadDeviceCert(json);
    if (certData) {
        const deviceCert = {
            class: 'DeviceCertificate',
            certificate: {
                base64: Buffer.from(certData.certificate).toString('base64')
            },
            privateKey: {
                base64: Buffer.from(certData.privateKey).toString('base64')
            }
        };
        declaration.Common.deviceCertificate = deviceCert;
    }

    // License: get info from bigip.license file
    const regKey = getRegKey();
    if (regKey) {
        declaration.Common.License = {
            class: 'License',
            licenseType: 'regKey',
            regKey
        };
    }

    return declaration;
};
