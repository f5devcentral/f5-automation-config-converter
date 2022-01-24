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

/* eslint-disable global-require */

const dictArr = [
    require('./customMaps/certificate'),
    require('./customMaps/cipher'),
    require('./customMaps/data_group'),
    require('./customMaps/dns'),
    require('./customMaps/enforcement'),
    require('./customMaps/firewall'),
    require('./customMaps/gslb'),
    require('./customMaps/html_rule'),
    require('./customMaps/iapp'),
    require('./customMaps/irule'),
    require('./customMaps/log_config'),
    require('./customMaps/monitor'),
    require('./customMaps/network'),
    require('./customMaps/persist'),
    require('./customMaps/policy'),
    require('./customMaps/pool'),
    require('./customMaps/profile'),
    require('./customMaps/security'),
    require('./customMaps/service'),
    require('./customMaps/service_address'),
    require('./customMaps/snat_pool')
];

module.exports = Object.assign(...dictArr);
