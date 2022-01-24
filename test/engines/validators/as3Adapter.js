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

const AS3Parser = require('../../../autotoolDeps/AS3/src/lib/adcParser');
const as3Schema = require('../../../autotoolDeps/AS3/src/schema/latest/adc-schema.json');

const parser = new AS3Parser();
parser.cloudSecrets = [];
parser.components = [];
parser.fetches = [];
parser.secrets = [];
parser.longSecrets = [];
parser.context = {
    host: { sdInstalled: true },
    target: {
        provisionedModules: ['afm', 'apm', 'asm', 'avr', 'em', 'fps', 'gtm', 'pem']
    }
};
parser.loadSchema(as3Schema);

module.exports = (declaration) => {
    const isValid = parser.validator(declaration);
    parser.validatePathLength(declaration);
    return Promise.resolve({
        isValid,
        errors: !isValid ? parser.validator.errors[0] : []
    });
};
