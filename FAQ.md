# Frequently Asked Questions
This page contains information and frequently asked questions on the F5 AS3 Configuration Converter (ACC).

### What is it and what does it do?
  - CLI-based tool which converts BIG-IP configurations into AS3 declarations
  - Input (any of the following):
    - UCS file
    - SCF file
    - bigip.conf file
  - Output:
    - Valid AS3 declaration stanzas (some manipulation of stanzas may be required)
  - Counts and identifies both supported and unsupported configuration objects

### Why are we building it?
  - To have the ability to migrate installed base configurations to AS3 declarations as well as deploy new BIG-IPs with AS3.
 
### Which key AS3 classes & features are supported?
As a rule of thumb, ACC provides best-effort support for all AS3 classes EXCEPT for WAF_Policy.

  - Certificates:
    - CA_Bundle
    - Certificate
    - Certificate_Validator_OCSP

  - Cipher:
    - Cipher_Group
    - Cipher_Rule

  - DNS:
    - DNS_Nameserver
    - DNS_TSIG_Key
    - DNS_Zone

  - Enforcement:
    - Enforcement_Diameter_Endpoint_Profile
    - Enforcement_Format_Script
    - Enforcement_Forwarding_Endpoint
    - Enforcement_Interception_Endpoint
    - Enforcement_Listener
    - Enforcement_Policy
    - Enforcement_Profile
    - Enforcement_Radius_AAA_Profile
    - Enforcement_Service_Chain_Endpoint
    - Enforcement_Subscriber_Management_Profile

  - Firewall:
    - Firewall_Address_List
    - Firewall_Port_List
    - Firewall_Rule_List
    - Firewall_Policy
    - NAT_Policy
    - NAT_Source_Translation

  - GSLB:
    - GSLB_Data_Center
    - GSLB_Domain (A, AAAA, MX)
    - GSLB_Monitor (HTTP, HTTPS, ICMP, TCP, UDP)
    - GSLB_Pool (A, AAAA, CNAME, MX)
    - GSLB_Prober_Pool
    - GSLB_Server
    - GSLB_Topology_Records
    - GSLB_Topology_Region

  - Logging:
    - Log_Destination (remote-high-speed-log)
    - Log_Destination (remote-syslog)
    - Log_Publisher
    - Traffic_Log_Profile

  - Miscellaneous:
    - Certificate_Validator_OCSP
    - Data_Group
    - iRule
    - Service_Address

  - Monitors:
    - Monitor DNS
    - Monitor External
    - Monitor FTP
    - Monitor HTTP
    - Monitor HTTPS
    - Monitor ICMP
    - Monitor LDAP
    - Monitor RADIUS
    - Monitor SIP
    - Monitor SMTP
    - Monitor TCP
    - Monitor TCP-Half-Open
    - Monitor UDP

  - Persistence Profile:
    - Persist Addr (dest-address)
    - Persist Addr (source-address)
    - Persist (cookie)
    - Persist (hash)
    - Persist (msrdp)
    - Persist (sip-info)
    - Persist (tls-session-id)
    - Persist (universal)

  - Policies:
    - Bandwidth_Control_Policy
    - Endpoint_Policy
    - Endpoint_Strategy

  - Pools:
    - Pool
    - SNAT_Pool

  - Protocol Profiles:
    - Analytics_Profile
    - Analytics_TCP_Profile
    - Capture_Filter
    - Classification_Profile
    - DNS_Profile
    - FIX_Profile
    - FTP_Profile
    - HTTP_Acceleration_Profile
    - HTTP_Compress
    - HTTP_Profile
    - HTTP2_Profile
    - HTTP_Profile_Explicit
    - HTTP_Profile_Reverse
    - HTTP_Profile_Transparent
    - ICAP_Profile
    - IP_Other_Profile
    - L4_Profile
    - Multiplex_Profile
    - Radius_Profile
    - Rewrite_Profile
    - SIP_Profile
    - Stream_Profile
    - TCP_Profile
    - TLS_Client
    - TLS_Server
    - Traffic_Log_Profile
    - UDP_Profile

  - Security:
    - DOS_Profile
    - NAT_Policy
    - NAT_Source_Translation
    - Protocol_Inspection_Profile
    - Security_Log_Profile
    - SSH_Proxy_Profile

  - Services:
    - Service_Forwarding
    - Service_Generic
    - Service_HTTP
    - Service_HTTPS
    - Service_L4
    - Service_TCP
    - Service_UDP

### Certificate Handling

**Note:** ACC's responsibility is not certificate management. Best practice for certificate handling is to use a certifcate management tool.

An example bigip.conf file:

```
sys file ssl-cert /AS3_Tenant/AS3_Application/theCert-bundle.crt {
    cache-path /config/filestore/files_d/AS3_Tenant_d/certificate_d/:AS3_Tenant:AS3_Application:theCert-bundle.crt_121204_1
    revision 1
    source-path file:/var/config/rest/downloads/_AS3_Tenant_AS3_Application_theCert-bundle.crt
}
sys file ssl-cert /AS3_Tenant/AS3_Application/theCert.crt {
    cache-path /config/filestore/files_d/AS3_Tenant_d/certificate_d/:AS3_Tenant:AS3_Application:theCert.crt_121202_1
    revision 1
    source-path file:/var/config/rest/downloads/_AS3_Tenant_AS3_Application_theCert.crt
}
sys file ssl-key /AS3_Tenant/AS3_Application/theCert.key {
    cache-path /config/filestore/files_d/AS3_Tenant_d/certificate_key_d/:AS3_Tenant:AS3_Application:theCert.key_121206_1
    passphrase $M$SC$h0EYWoK2safpVE58IjN7qQ==
    revision 1
    source-path file:/var/config/rest/downloads/_AS3_Tenant_AS3_Application_theCert.key
}
```


```
"theCert": {
    "class": "Certificate",
    "passphrase": {
       "ciphertext": "JE0kU0MkaDBFWVdvSzJzYWZwVkU1OElqTjdxUT09",
       "protected": "eyJhbGciOiJkaXIiLCJlbmMiOiJmNXN2In0=",
       "ignoreChanges": true
    }
 }
```
If the input file has the certificates and keys in /Common/ (without any subfolders), then ACC creates the certificate object in /Common/Shared providing references to the objects in /Common/. 

If the input file has the certificates and keys in a subfolder such as /Common/< subfolder >/ or in /AS3_Tenant/AS3_Application/, for example, then ACC will generate AS3 certificates providing full certificate information such as crt, secret, passwords etc. with no reference to /Common/.

**Important Notes:** 
1. When the file path contains subfolders, the certificate files can only be created using .ucs files since .scf and .conf files do not contain certificate information resulting in empty certificate files. 

2. The certificate, key and chain content will be part of the AS3 declaration in the form of plain text.

```
"theCert": {
    "class": "Certificate",
    "certificate": "-----BEGIN CERTIFICATE-----... -----END CERTIFICATE-----",
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----...-----END RSA PRIVATE KEY-----",
    "chainCA": "-----BEGIN CERTIFICATE-----....-----END CERTIFICATE-----",
    "passphrase": {
       "ciphertext": "JE0kU0MkaDBFWVdvSzJzYWZwVkU1OElqTjdxUT09",
       "protected": "eyJhbGciOiJkaXIiLCJlbmMiOiJmNXN2In0=",
       "ignoreChanges": true
    }
}
```

### What are the sources of object name collisions?
Although there are instances where BIG-IP will tolerate multiple objects with the same name (e.g. a Pool and Service both named /Common/testItem), these objects do not meet the AS3 validation schema. As a result, the converter will add _dup to duplicate object name and will handle the object's properties and dependencies. Due to the large number of AS3 supported objects, it is difficult to convert all objects with duplicate names. See [AS3 Schema Reference](https://clouddocs.f5.com/products/extensions/f5-appsvcs-extension/latest/refguide/schema-reference.html) for more information.

This is a list of currently supported AS3 objects:
  - `ltm pool`
  - `ltm profile`
  - `ltm virtual`
  - `ltm rule`
  - `ltm policy`

This list may be extended on request.
If a non-supported object has been found, simply notify and skip any identically named objects.

Due to the more-restrictive AS3 schema, there are two transformations applied to object names while they are being converted. Each transformation has the potential to introduce new collisions.

### What else do I need to know?
  - Object names over 194 characters in length will be trimmed
  - Only the noted BIG-IP configuration object types are supported
  - Coverage of configuration objects will increase over time
  - ACC will be delivered via container-based packaging
  - ACC maps /Common to /Common/Shared
  - TCL iApps are not supported

**Note:** For additional information on ACC partition mapping, see the *When does AS3 write to the Common partition for LTM configurations?* section of the  [AS3 FAQ](https://clouddocs.f5.com/products/extensions/f5-appsvcs-extension/latest/userguide/faq.html).

