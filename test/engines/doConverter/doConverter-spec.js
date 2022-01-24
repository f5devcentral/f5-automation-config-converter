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

describe('Declarative Onboarding (doConverter.js)', () => {
    require('./analytics/spec');
    require('./configsync/spec');
    require('./dagglobals/spec');
    require('./dbvariables/spec');
    require('./devicegroup/spec');
    require('./dns/spec');
    require('./dns_resolver/spec');
    require('./failovermulticast/spec');
    require('./failoverunicast/spec');
    require('./firewalladdresslist/spec');
    require('./firewallportlist/spec');
    require('./gslbdatacenter/spec');
    require('./gslbglobals/spec');
    require('./gslbmonitor/spec');
    require('./gslbproberpool/spec');
    require('./gslbserver/spec');
    require('./httpd/spec');
    require('./license/spec');
    require('./managementip/spec');
    require('./managementroute/spec');
    require('./mirrorip/spec');
    require('./ntp/spec');
    require('./provision/spec');
    require('./route/spec');
    require('./selfip/spec');
    require('./snmpagent/spec');
    require('./snmptrapevents/spec');
    require('./sshd/spec');
    require('./system/spec');
    require('./trafficcontrol/spec');
    require('./trafficgroup/spec');
    require('./trunk/spec');
    require('./tunnel/spec');
    require('./user/spec');
    require('./vlan/spec');
});
