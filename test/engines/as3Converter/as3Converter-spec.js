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

describe('Convert to AS3 declaration (as3Converter.js)', () => {
    require('./analytics_profile/spec');
    require('./analytics_tcp_profile/spec');
    require('./bandwidth_control_policy/spec');
    require('./ca_bundle/spec');
    require('./certificate/spec');
    require('./certificate_validator_ocsp/spec');
    require('./cipher_group/spec');
    require('./cipher_rule/spec');
    require('./classification_profile/spec');
    require('./data_group/spec');
    require('./dns_cache/spec');
    require('./dns_nameserver/spec');
    require('./dns_profile/spec');
    require('./dns_tsig_key/spec');
    require('./dns_zone/spec');
    require('./dos_profile/spec');
    require('./endpoint_policy/spec');
    require('./endpoint_strategy/spec');
    require('./enforcement_diameter_endpoint_profile/spec');
    require('./enforcement_format_script/spec');
    require('./enforcement_forwarding_endpoint/spec');
    require('./enforcement_interception_endpoint/spec');
    require('./enforcement_listener/spec');
    require('./enforcement_policy/spec');
    require('./enforcement_profile/spec');
    require('./enforcement_radius_aaa_profile/spec');
    require('./enforcement_service_chain_endpoint/spec');
    require('./enforcement_subscriber_management_profile/spec');
    require('./firewall_address_list/spec');
    require('./firewall_policy/spec');
    require('./firewall_port_list/spec');
    require('./firewall_rule_list/spec');
    require('./fix_profile/spec');
    require('./ftp_profile/spec');
    require('./gslb_data_center/spec');
    require('./gslb_domain/spec');
    require('./gslb_monitor/spec');
    require('./gslb_pool/spec');
    require('./gslb_prober_pool/spec');
    require('./gslb_server/spec');
    require('./gslb_topology_region/spec');
    require('./gslb_topology_records/spec');
    require('./http_acceleration_profile/spec');
    require('./http_compress/spec');
    require('./http_profile/spec');
    require('./http2_profile/spec');
    require('./iapp/spec');
    require('./icap_profile/spec');
    require('./idle_timeout_policy/spec');
    require('./ip_other_profile/spec');
    require('./irule/spec');
    require('./l4_profile/spec');
    require('./log_destination/spec');
    require('./log_publisher/spec');
    require('./monitor_dns/spec');
    require('./monitor_external/spec');
    require('./monitor_ftp/spec');
    require('./monitor_http/spec');
    require('./monitor_http2/spec');
    require('./monitor_https/spec');
    require('./monitor_icmp/spec');
    require('./monitor_ldap/spec');
    require('./monitor_mysql/spec');
    require('./monitor_postgresql/spec');
    require('./monitor_radius/spec');
    require('./monitor_sip/spec');
    require('./monitor_smtp/spec');
    require('./monitor_tcp/spec');
    require('./monitor_tcp-half-open/spec');
    require('./monitor_udp/spec');
    require('./multiplex_profile/spec');
    require('./nat_policy/spec');
    require('./nat_source_translation/spec');
    require('./persist_cookie/spec');
    require('./persist_dest-addr/spec');
    require('./persist_hash/spec');
    require('./persist_msrdp/spec');
    require('./persist_sip-info/spec');
    require('./persist_src-addr/spec');
    require('./persist_tls-session-id/spec');
    require('./persist_universal/spec');
    require('./pool/spec');
    require('./protocol_inspection_profile/spec');
    require('./radius_profile/spec');
    require('./rewrite_profile/spec');
    require('./security_log_profile/spec');
    require('./service_address/spec');
    require('./service_forwarding/spec');
    require('./service_generic/spec');
    require('./service_http/spec');
    require('./service_https/spec');
    require('./service_l4/spec');
    require('./service_tcp/spec');
    require('./service_udp/spec');
    require('./sip_profile/spec');
    require('./snat_pool/spec');
    require('./ssh_proxy_profile/spec');
    require('./stream_profile/spec');
    require('./tcp_profile/spec');
    require('./tls_client/spec');
    require('./tls_server/spec');
    require('./traffic_log_profile/spec');
    require('./udp_profile/spec');
});
