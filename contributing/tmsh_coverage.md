Enumeration of LTM objects on 16.1.1 as returned by tmsh

Last updated 2-3-2022

183 enumerated ltm components
ACC+AS3 support for 75 ltm components
~41.0% coverage

ltm eviction-policy
ltm ifile
ltm nat
# ltm node
# ltm policy
# ltm policy-strategy
# ltm pool
# ltm rule
ltm rule-profiler
ltm snat
# ltm snat-translation
# ltm snatpool
ltm traffic-class
# ltm traffic-matching-criteria
# ltm virtual
# ltm virtual-address

ltm auth crldp-server
ltm auth kerberos-delegation
ltm auth ldap
ltm auth ocsp-responder
ltm auth profile
ltm auth radius
ltm auth radius-server
ltm auth ssl-cc-ldap
ltm auth ssl-crldp
ltm auth ssl-ocsp
ltm auth tacacs

# ltm cipher group
# ltm cipher rule

ltm classification application
ltm classification category
ltm classification ce
ltm classification url-cat-policy
ltm classification url-category
ltm classification urldb-feed-list

# ltm data-group external
# ltm data-group internal

# ltm dns nameserver
# ltm dns tsig-key
# ltm dns zone

ltm dns cache resolver
# ltm dns cache transparent
ltm dns cache validating-resolver

ltm dns dnssec key
ltm dns dnssec zone

ltm global-settings connection
ltm global-settings general
ltm global-settings rule
ltm global-settings traffic-control

# ltm html-rule comment-raise-event
# ltm html-rule comment-remove
# ltm html-rule tag-append-html
# ltm html-rule tag-prepend-html
# ltm html-rule tag-raise-event
# ltm html-rule tag-remove
# ltm html-rule tag-remove-attribute

ltm message-routing generic
ltm message-routing mqtt

ltm message-routing diameter peer
ltm message-routing diameter route
ltm message-routing diameter transport-config

ltm message-routing diameter profile router
ltm message-routing diameter profile session

ltm monitor diameter
# ltm monitor dns
# ltm monitor external
ltm monitor firepass
# ltm monitor ftp
ltm monitor gateway-icmp
# ltm monitor http
# ltm monitor http2
# ltm monitor https
# ltm monitor icmp
ltm monitor imap
ltm monitor inband
# ltm monitor ldap
ltm monitor module-score
ltm monitor mqtt
ltm monitor mssql
# ltm monitor mysql
ltm monitor nntp
ltm monitor oracle
ltm monitor pop3
# ltm monitor postgresql
# ltm monitor radius
ltm monitor radius-accounting
ltm monitor real-server
ltm monitor rpc
ltm monitor sasp
ltm monitor scripted
# ltm monitor sip
ltm monitor smb
# ltm monitor smtp
ltm monitor snmp-dca
ltm monitor snmp-dca-base
ltm monitor soap
# ltm monitor tcp
ltm monitor tcp-echo
# ltm monitor tcp-half-open
# ltm monitor udp
ltm monitor virtual-location
ltm monitor wap
ltm monitor wmi

# ltm persistence cookie
# ltm persistence dest-addr
# ltm persistence hash
ltm persistence host
# ltm persistence msrdp
# ltm persistence sip
# ltm persistence source-addr
# ltm persistence ssl
# ltm persistence universal

# ltm profile analytics (not on 16.1)
ltm profile certificate-authority
# ltm profile classification
ltm profile client-ldap
# ltm profile client-ssl
ltm profile connector
ltm profile dhcpv4
ltm profile dhcpv6
ltm profile diameter
# ltm profile dns
ltm profile dns-logging
ltm profile doh-proxy
ltm profile doh-server
ltm profile fasthttp
# ltm profile fastl4
# ltm profile fix
# ltm profile ftp
ltm profile georedundancy
ltm profile gtp
# ltm profile html
# ltm profile http
# ltm profile http-compression
ltm profile http-proxy-connect
# ltm profile http2
ltm profile http3
ltm profile httprouter
# ltm profile icap
ltm profile imap
# ltm profile ipother
ltm profile ipsecalg
ltm profile mblb
ltm profile mqtt
ltm profile mr-ratelimit
ltm profile nat-stats
ltm profile netflow
ltm profile ntlm
ltm profile ocsp
ltm profile ocsp-stapling-params
# ltm profile one-connect
ltm profile pcp
ltm profile pop3
ltm profile pptp
ltm profile qoe
ltm profile quic
# ltm profile radius
# ltm profile request-adapt
# ltm profile request-log
# ltm profile response-adapt
# ltm profile rewrite
ltm profile rtsp
ltm profile sctp
ltm profile server-ldap
# ltm profile server-ssl
ltm profile service
# ltm profile sip
ltm profile smtps
ltm profile socks
ltm profile splitsessionclient
ltm profile splitsessionserver
ltm profile statistics
# ltm profile stream
# ltm profile tcp
# ltm profile tcp-analytics
ltm profile tdr
ltm profile tftp
# ltm profile udp
# ltm profile web-acceleration
ltm profile websocket
ltm profile xml

ltm tacdb customdb
ltm tacdb customdb-file




Enumeration of GTM objects on 16.1.1 as returned by tmsh

Last updated 2-3-2022

58 enumerated gtm components
ACC+AS3+DO support for 19 gtm components
~32.7% coverage

# gtm datacenter
gtm distributed-app
gtm link
gtm listener
gtm listener-doh-proxy
gtm listener-doh-server
# gtm prober-pool
# gtm region
# gtm rule
# gtm server
# gtm topology

# gtm global-settings general (only supported by DO)
gtm global-settings load-balancing
gtm global-settings metrics
gtm global-settings metrics-exclusions

gtm monitor bigip
gtm monitor bigip-link
gtm monitor external
gtm monitor firepass
gtm monitor ftp
# gtm monitor gateway-icmp
gtm monitor gtp
# gtm monitor http
# gtm monitor https
gtm monitor imap
gtm monitor ldap
gtm monitor mssql
gtm monitor mysql
gtm monitor nntp
gtm monitor oracle
gtm monitor pop3
gtm monitor postgresql
gtm monitor radius
gtm monitor radius-accounting
gtm monitor real-server
gtm monitor scripted
gtm monitor sip
gtm monitor smtp
gtm monitor snmp
gtm monitor snmp-link
gtm monitor soap
# gtm monitor tcp
gtm monitor tcp-half-open
# gtm monitor udp
gtm monitor wap
gtm monitor wmi

# gtm pool a
# gtm pool aaaa
# gtm pool cname
# gtm pool mx
gtm pool naptr
gtm pool srv

# gtm wideip a
# gtm wideip aaaa
gtm wideip cname
# gtm wideip mx
gtm wideip naptr
gtm wideip srv




Enumeration of NET objects on 16.1.1 as returned by tmsh

Last updated 7-22-2022

58 enumerated net components
ACC+AS3+DO support for 17 gtm components
~29.3% coverage

# net address-list
net arp
# net bwc policy
net bwc priority-group
net cos map-8021p
net cos map-dscp
net cos traffic-priority
# net dns-resolver
net ipsec ike-peer
net ipsec ipsec-policy
net ipsec manual-security-association
net ipsec traffic-selector
net ndp
net packet-filter
# net port-list
net port-mirror
net rate-shaping class
net rate-shaping color-policer
net rate-shaping drop-policy
net rate-shaping queue
net rate-shaping shaping-policy
# net route
# net route-domain
net router-advertisement

net routing profile bgp
# net routing access-list
# net routing as-path
net routing bfd
# net routing bgp
net routing community-list
net routing debug
net routing extcommunity-list
# net routing prefix-list
# net routing route-map

# net self
# net service-policy
net sfc chain
net sfc sf
net stp
# net timer-policy
# net trunk

net tunnels etherip
net tunnels fec
net tunnels geneve
net tunnels gre
net tunnels ipip
net tunnels ipsec
net tunnels lw4o6
net tunnels map
net tunnels ppp
net tunnels tcp-forward
# net tunnels tunnel
net tunnels v6rd
net tunnels vxlan
net tunnels wccp

# net vlan
net vlan-group
net wccp




Enumeration of PEM objects on 16.1.2 as returned by tmsh

Last updated 7-22-2022

18 enumerated pem components
ACC+AS3 support for 11 pem components
~61.1% coverage

Enumeration of PEM objects

# pem forwarding-endpoint
# pem interception-endpoint
# pem irule
# pem listener
# pem policy
# pem service-chain-endpoint
pem subscriber
pem subscriber-attribute

# pem profile diameter-endpoint
# pem profile radius-aaa
# pem profile spm
# pem profile subscriber-mgmt

pem protocol diameter-avp
pem protocol radius-avp

pem protocol profile diameter
pem protocol profile radius

pem quota-mgmt rating-group

# pem reporting format-script
