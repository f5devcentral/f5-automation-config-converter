.. _classes:

Which key AS3 classes/features are supported?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

As a rule of thumb, ACC provides best-effort support for all AS3 classes EXCEPT for WAF_Policy.

| Certificates:
* CA_Bundle
* Certificate
* Certificate_Validator_OCSP

| Cipher:
* Cipher_Group
* Cipher_Rule

| Content:
* HTML_Profile
* HTML_Rule

| DNS:
* DNS_Nameserver
* DNS_TSIG_Key
* DNS_Zone

| Enforcement:
* Enforcement_Diameter_Endpoint_Profile
* Enforcement_Format_Script
* Enforcement_Forwarding_Endpoint
* Enforcement_Interception_Endpoint
* Enforcement_Listener
* Enforcement_Policy
* Enforcement_Profile
* Enforcement_Radius_AAA_Profile
* Enforcement_Service_Chain_Endpoint
* Enforcement_Subscriber_Management_Profile

| Firewall:
* Firewall_Address_List
* Firewall_Port_List
* Firewall_Rule_List
* Firewall_Policy
* NAT_Policy
* NAT_Source_Translation

| GSLB:
* GSLB_Data_Center
* GSLB_Domain (A, AAAA, MX)
* GSLB_Monitor (HTTP, HTTPS, ICMP, TCP, UDP)
* GSLB_Pool (A, AAAA, CNAME, MX)
* GSLB_Prober_Pool
* GSLB_Server
* GSLB_Topology_Records
* GSLB_Topology_Region

| Logging:
* Log_Destination (remote-high-speed-log)
* Log_Destination (remote-syslog)
* Log_Publisher
* Traffic_Log_Profile

| Miscellaneous:
* Certificate_Validator_OCSP
* Data_Group
* iRule
* Service_Address

| Monitors:
* Monitor DNS
* Monitor External
* Monitor FTP
* Monitor HTTP
* Monitor HTTPS
* Monitor ICMP
* Monitor LDAP
* Monitor PostgreSQL
* Monitor RADIUS
* Monitor SIP
* Monitor SMTP
* Monitor TCP
* Monitor TCP-Half-Open
* Monitor UDP
* Monitor MySQL

| Persistence Profile:
* Persist Addr (dest-address)
* Persist Addr (source-address)
* Persist (cookie)
* Persist (hash)
* Persist (msrdp)
* Persist (sip-info)
* Persist (tls-session-id)
* Persist (universal)

| Policies:
* Bandwidth_Control_Policy
* Endpoint_Policy
* Endpoint_Strategy
* Idle_Timeout_Policy

| Pools:
* Pool
* SNAT_Pool

| Protocol Profiles:
* Adapt_Profile
* Analytics_Profile
* Analytics_TCP_Profile
* Capture_Filter
* Classification_Profile
* DNS_Profile
* FIX_Profile
* FTP_Profile
* HTTP_Acceleration_Profile
* HTTP_Compress
* HTTP_Profile
* HTTP2_Profile
* HTTP_Profile_Explicit
* HTTP_Profile_Reverse
* HTTP_Profile_Transparent
* ICAP_Profile
* IP_Other_Profile
* L4_Profile
* Multiplex_Profile
* Radius_Profile
* Rewrite_Profile
* SIP_Profile
* Stream_Profile
* TCP_Profile
* TLS_Client
* TLS_Server
* Traffic_Log_Profile
* UDP_Profile

| Security:
* DOS_Profile
* NAT_Policy
* NAT_Source_Translation
* Protocol_Inspection_Profile
* Security_Log_Profile
* SSH_Proxy_Profile

| Services:
* Service_Forwarding
* Service_Generic
* Service_HTTP
* Service_HTTPS
* Service_L4
* Service_TCP
* Service_UDP

Which key DO classes are supported?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

ACC provides best-effort support for the following DO classes:

* Analytics
* ConfigSync
* DagGlobals
* DbVariables
* DeviceGroup
* DNS
* DNS_Resolver
* FailoverMulticast
* FailoverUnicast
* FirewallAddressList
* FirewallPolicy
* FirewallPortList
* GSLBDataCenter
* GSLBGlobals
* GSLBMonitor
* GSLBServer
* GSLBProberPool
* HTTPD
* License
* ManagementIp
* ManagementRoute
* MirrorIp
* NTP
* Provision
* RemoteAuthRole
* Route
* RouteDomain
* RouteMap
* RoutingAccessList
* RoutingAsPath
* RoutingBGP
* RoutingPrefixList
* SelfIp
* SnmpAgent
* SnmpCommunity
* SnmpTrapDestination
* SnmpTrapEvents
* SnmpUser
* SSHD
* SyslogRemoteServer
* System
* TrafficControl
* TrafficGroup
* Tunnel
* User
* VLAN

Unsupported DO classes:

* DeviceTrust
