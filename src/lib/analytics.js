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

const fs = require('fs').promises;
const uuid = require('uuid');

const Record = require('@f5devcentral/f5-teem').Record;
const TeemDevice = require('@f5devcentral/f5-teem').AnonymousDevice;
const getBigipVersion = require('../util/getBigipVersion');
const { version } = require('../../package.json');

const getDeviceInfo = (data) => {
    try {
        const baseConf = data['config/bigip_base.conf'];
        const license = data['config/bigip.license'];
        return {
            license: /Registration Key :\s+([\w-]+)\n/g.exec(license)[1],
            platform: /product\s+([\w-]+)\n/g.exec(baseConf)[1],
            platformId: /platform-id\s+([\w-]+)\n/g.exec(baseConf)[1]
        };
    } catch (e) {
        return {};
    }
};

// ACC will create a uuid dotfile to uniquely identify users
const getAssetId = (config) => {
    const prefix = config.container ? '/app/data/' : '';
    const newUuid = uuid.v4();
    return Promise.resolve()
        .then(() => fs.readFile(`${prefix}.f5-acc`, 'utf-8'))
        .catch(() => fs.writeFile(`${prefix}.f5-acc`, newUuid, 'utf-8')
            .then(() => newUuid))
        .catch(() => {});
};

const getKeyCount = (tmpObj) => {
    const keyList = Object.keys(tmpObj);
    const keyCount = {};
    keyList.forEach((key) => {
        const tmp = key.split(' ').slice(0, 2).join(' ');
        keyCount[tmp] = (keyCount[tmp] || 0) + 1;
    });

    return keyCount;
};

module.exports = (data, result, config) => {
    if (config.disableAnalytics) return Promise.resolve();

    let runtime = 'cli';
    if (config.server) runtime = 'server';
    if (config.chariot) runtime = 'f5-chariot';

    // Pull platform info, default to 'unknown'
    const deviceInfo = getDeviceInfo(data);

    const platformInfo = {
        platformId: deviceInfo.platformId || 'unknown',
        platform: deviceInfo.platform || 'unknown',
        platformVersion: getBigipVersion(data) || 'unknown',
        registrationKey: deviceInfo.license || 'unknown'
    };

    const extraFields = {
        arguments: process.argv.slice(2),
        declarationSize: JSON.stringify(result.declaration).length,
        engine: config.declarativeOnboarding ? 'DO' : 'AS3',
        inputSize: JSON.stringify(data).length,
        isContainer: process.env.DOCKER_CONTAINER === 'true',
        runtime,
        unsupportedStats: result.unsupportedStats
    };

    // Expand AS3 analytics with more data
    if (extraFields.engine === 'AS3') {
        // supported
        extraFields.as3Converted = Object.keys(result.metadata.as3Converted).length;
        extraFields.as3ConvertedKeyCount = getKeyCount(result.metadata.as3Converted);
        // unsupported
        extraFields.as3NotConverted = Object.keys(result.metadata.as3NotConverted).length;
        extraFields.as3NotConvertedKeyCount = getKeyCount(result.metadata.as3NotConverted);
        // recognized
        extraFields.as3Recognized = Object.keys(result.metadata.as3Recognized).length;
        extraFields.as3RecognizedKeyCount = getKeyCount(result.metadata.as3Recognized);
    }

    const assetInfo = {
        name: 'Automation Config Converter',
        version,
        id: 'unknown'
    };

    const record = new Record('ACC Telemetry Data', '1');

    return Promise.resolve()
        .then(() => record.addClassCount(result.declaration))
        .then(() => record.addJsonObject(platformInfo))
        .then(() => record.addJsonObject(extraFields))
        .then(() => getAssetId(config))
        .then((assetId) => { assetInfo.id = assetId; })
        // TEEM_KEY var can be set by external apps
        .then(() => process.env.TEEM_KEY || fs.readFile('TEEM_KEY', 'utf-8'))
        .then((key) => new TeemDevice(assetInfo, key).reportRecord(record))
        .catch(() => {});
};
