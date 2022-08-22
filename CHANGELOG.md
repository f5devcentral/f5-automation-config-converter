# Changelog
Changes to this project are documented in this file.

## 1.23.0

## Added
- CHARON-594: Add support for Enforcement_iRule
- CHARON-595: Add support for Service_SCTP
- CHARON-639: Add support for Net_Address_List class
- CHARON-685: Add support for GSLB_iRule

## Fixed
- CHARON-728: ([GitHub Issue 90](https://github.com/f5devcentral/f5-automation-config-converter/issues/90)):
Bypass "sys crypto cert-order-manager" to avoid a parser failure

## Changed
- CHARON-612: Replace external IPv4 addresses w/ internal addresses (RFC 1918, RFC 5737)
- CHARON-613: Replace external IPv6 addresses w/ internal addresses (RFC 3849, RFC 4193)

## Removed

## 1.22.0

## Added
- CHARON-669: [AS3Next] Implement pruning logic using installed NPM package
- CHARON-671: [AS3Next] AS3 Next Metric
- CHARON-672: [AS3Next] Fix AS3 Next TEEM Data
- CHARON-673: [AS3Next] Pre-view label when using AS3 Next conversion
- CHARON-682: [AS3Next] AS3 next package reference
- CHARON-684: [AS3Next] Obtain shared schema version
- CHARON-690: [AS3Next] Test AS3Next declarations on real BIG-IP next, fix
- CHARON-694: [AS3Next] Provide right API output for Next

## Fixed
- CHARON-692: ([GitHub Issue 89](https://github.com/f5devcentral/f5-automation-config-converter/issues/89)):
Add protection against mis-indented input

## Changed

## Removed

## 1.21.0

## Added
- CHARON-634: Add as3Converted/as3NotConverted/as3Recognized to TEEM data
- CHARON-665: Check all default profiles presented in ACC

## Fixed
- CHARON-513 DO selfIP: add mixed conversion for allow-service
- CHARON-647: ([GitHub Issue 75](https://github.com/f5devcentral/f5-automation-config-converter/issues/75)):
ACC not convert recv none string into AS3 declaration correctly
- CHARON-662: ([GitHub Issue 88](https://github.com/f5devcentral/f5-automation-config-converter/issues/88)):
ACC missing TCP Profile values after conversion
- CHARON-686: CVE-2022-24434 dicer vulnerability

## Changed

## Removed

## 1.20.0

## Added
- CHARON-582: [VSCODE] Coordinate use of TEEM_KEY works for integration/docker-image runtimes

## Fixed
- CHARON-623: ([GitHub Issue 86](https://github.com/f5devcentral/f5-automation-config-converter/issues/86)):
ServerTLS missing from conversion when using RESTAPI vsName filter
- CHARON-635: [Paycom] TypeError: Error converting input file

## Changed

## Removed

## 1.19.2

## Fixed
- CHARON-633: CVE-2022-0778 libretls vulnerability

## 1.19.1

## Fixed
- CHARON-621: ([GitHub Issue 82](https://github.com/f5devcentral/f5-automation-config-converter/issues/82)):
TLS1.0 in Certificate Name does not convert properly
- CHARON-625: ([GitHub Issue 85](https://github.com/f5devcentral/f5-automation-config-converter/issues/85)):
v1.19.0 DO convert fails with stack trace

## 1.19.0

## Added
- CHARON-331: Add DO support for class: Authentication
- CHARON-336: Add DO support for class: DeviceCertificate
- CHARON-396: Refactor analytics for DO mode
- CHARON-398: Analyze generated DO declarations (count classes, objects, metadata, etc)
- CHARON-596: Add DO support for ManagementIpFirewall
- CHARON-601: [AS3] Add support and tests for GSLB_Domain (gtm wideip cname)
- CHARON-602: [AS3] Add support and tests for GSLB_Monitor (gtm monitor external)

## Fixed
- CHARON-490: Clean up empty (and default) DO classes
- CHARON-579: Don't convert default route-domain 0
- CHARON-584: ([GitHub Issue 78](https://github.com/f5devcentral/f5-automation-config-converter/issues/78)):
iRule regex parsing might cause an indefinite hang
- CHARON-587: ([GitHub Issue 79](https://github.com/f5devcentral/f5-automation-config-converter/issues/79)):
Strings containing braces might cause an indefinite hang
- CHARON-604: iRule parsing hangs in 1.19-RC1
- CHARON-605: Add support for HTTP_Profile.webSocketsEnabled and HTTP_Profile.webSocketMasking
- CHARON-607: Add log messages for filter by virtual server name

## Changed
- CHARON-570: Large refactor of recognized/supported/unsupported into as3Recognized/as3Converted/as3NotConverted

## Removed

## 1.18.0

## Added
- CHARON-352: Add support for class: RouteDomain
- CHARON-353: Add DO support for RouteMap
- CHARON-354: Add DO support for RoutingAsPath
- CHARON-355: Add DO support for RoutingBGP
- CHARON-356: Add DO support for RoutingPrefixList
- CHARON-565: Add DO support for RoutingAccessList
- CHARON-341: Add DO support for FirewallPolicy
- CHARON-363: Add DO support for SyslogRemoteServer
- CHARON-350: Add DO support for RemoteAuthRole
- CHARON-359: Add DO support for SnmpCommunity
- CHARON-360: Add DO support for SnmpTrapDestination
- CHARON-386: Add function to remove default DO values

## Fixed
- CHARON-544: Parser breakage with commented line contained { or } in iRule
- CHARON-567: ([GitHub Issue 77](https://github.com/f5devcentral/f5-automation-config-converter/issues/77)): Error when -v option is used to filter output by virtual server name

## Changed

## Removed
- CHARON-558: Remove revision history from docs

## 1.17.0

## Added
- CHARON-292: Add support for Adapt_Profile
- CHARON-406: Add support for HTML_Profile and HTML_Rule
- CHARON-425: Add debug logging
- CHARON-488: Migrate configuration using HTTP iAPP
- CHARON-542: ([GitHub Issue 61](https://github.com/f5devcentral/f5-automation-config-converter/issues/61)): Expose log output via HTTP API

## Fixed
- CHARON-525: ([GitHub Issue 70](https://github.com/f5devcentral/f5-automation-config-converter/issues/70)): Improve handling for TCP_Profile.md5SignaturePassphrase when set to 'none'

## Changed
- CHARON-281: Rename project to f5-automation-config-converter, update HTTP endpoint to /converter

## Removed

## 1.16.0

## Added
- CHARON-472: ([GitHub Issue 60](https://github.com/f5devcentral/f5-automation-config-converter/issues/60)): Add support for PostgreSQL Monitors
- CHARON-494: ([GitHub Issue 59](https://github.com/f5devcentral/f5-automation-config-converter/issues/59)): Add handling to remove invalid declaration refs

## Fixed
- CHARON-467: ([GitHub Issue 55](https://github.com/f5devcentral/f5-automation-config-converter/issues/55)): Improve handling when Common is empty
- CHARON-468: ([GitHub Issue 54](https://github.com/f5devcentral/f5-automation-config-converter/issues/54)): Fix ltm traffic-matching-criteria fields
- CHARON-469: ([GitHub Issue 57](https://github.com/f5devcentral/f5-automation-config-converter/issues/57)): Remove proxyCaCert, proxyCaKey and proxyCaPassphrase from TLS_Server
- CHARON-493: ([GitHub Issue 64](https://github.com/f5devcentral/f5-automation-config-converter/issues/64)): Remove TLS_Client.trustCA if value is 'none'
- CHARON-504: ([GitHub Issue 67](https://github.com/f5devcentral/f5-automation-config-converter/issues/67)): Improve passphrase handling for Monitor class
- CHARON-508: ([GitHub Issue 69](https://github.com/f5devcentral/f5-automation-config-converter/issues/69)): Improve handling when L4_Profile.keepAliveInterval is disabled
- CHARON-511: ([GitHub Issue 68](https://github.com/f5devcentral/f5-automation-config-converter/issues/68)): Improve handling for HTTP_Profile.knownMethods when parser returns an object

## Changed
- CHARON-277: Use @f5devcentral/f5-teem package for usage analytics
- CHARON-505: Revise safetyNet into safeMode (disables post-conversion processing)

## Removed

## 1.15.1

## Fixed
CHARON-475: Hotfix to disable legacy analytics module

## 1.15.0

## Added
- CHARON-404: ([GitHub Issue 43](https://github.com/f5devcentral/f5-automation-config-converter/issues/43)): Add detection for properties encrypted with SecureVault
- CHARON-401: ([GitHub Issue 39](https://github.com/f5devcentral/f5-automation-config-converter/issues/39)): Handle Service references to Service_Address objects
- CHARON-418: Add protocol-to-port number mapping
- CHARON-445: ([GitHub Issue 47](https://github.com/f5devcentral/f5-automation-config-converter/issues/47)): Add support for rejectVlans on Services
- CHARON-451: ([GitHub Issue 52](https://github.com/f5devcentral/f5-automation-config-converter/issues/52)): Add support for Data_Group (external)
- CHARON-452: ([GitHub Issue 53](https://github.com/f5devcentral/f5-automation-config-converter/issues/53)): Add passphrase handling for TLS_Client and TLS_Server

## Fixed
- CHARON-400: ([GitHub Issue 38](https://github.com/f5devcentral/f5-automation-config-converter/issues/38)): Fix certificate reference logic for individual cert
- CHARON-405: ([GitHub Issue 44](https://github.com/f5devcentral/f5-automation-config-converter/issues/44)): Improve stability when removing default values
- CHARON-433: ([GitHub Issue 49](https://github.com/f5devcentral/f5-automation-config-converter/issues/49)): Handle unprefixed profile paths
- CHARON-428: ([GitHub Issue 46](https://github.com/f5devcentral/f5-automation-config-converter/issues/46)): Improve handling for TLS_Server properties
- CHARON-450: ([GitHub Issue 51](https://github.com/f5devcentral/f5-automation-config-converter/issues/51)): Improve parsing of unnamed maps in FIX_Profile and DNS_Cache

## Changed
- CHARON-305: Handle strings in Firewall_Port_List
- CHARON-423: ([GitHub Issue 45](https://github.com/f5devcentral/f5-automation-config-converter/issues/45)): Persist comments when converting TCL or HTML to base64
- CHARON-446: Convert UCS in-memory
- CHARON-448: Convert uploaded files in-memory for server mode
- CHARON-427: Improve stability of removeDefaultValues function

## Removed

## 1.14.0

## Added
- CHARON-193: Add support for http2 monitor
- CHARON-315: ([GitHub Issue 28](https://github.com/f5devcentral/f5-automation-config-converter/issues/28)): Add Windows line endings support for config files
- CHARON-389: ([GitHub Issue 41](https://github.com/f5devcentral/f5-automation-config-converter/issues/41)): Support quoted strings with special characters as Data_Group records values

## Fixed
- CHARON-319: ([GitHub Issue 35](https://github.com/f5devcentral/f5-automation-config-converter/issues/35)): Virtual addresses duplicated in a virtual server

## Changed

## Removed

## 1.13.0

## Added
- CHARON-303: ([GitHub Issue 31](https://github.com/f5devcentral/f5-automation-config-converter/issues/31)): Support 'waf' type for Endpoint_Policy
- CHARON-306: ([GitHub Issue 22](https://github.com/f5devcentral/f5-automation-config-converter/issues/22)): Exit gracefully when file cannot be written

## Fixed
- CHARON-300: ([GitHub Issue 25](https://github.com/f5devcentral/f5-automation-config-converter/issues/25)): Incorrect use of /Shared reference for certificates under TLS_Server
- CHARON-302: ([GitHub Issue 30](https://github.com/f5devcentral/f5-automation-config-converter/issues/30)): Fix policyEndpoint references missing Application class name
- CHARON-316: ([GitHub Issue 29](https://github.com/f5devcentral/f5-automation-config-converter/issues/29)): Renaming duplicated objects' name results in invalid declaration
- CHARON-318: ([GitHub Issue 34](https://github.com/f5devcentral/f5-automation-config-converter/issues/34)): Nonexistent property for Service_Generic: vlansEnabled
- CHARON-320: ([GitHub Issue 36](https://github.com/f5devcentral/f5-automation-config-converter/issues/36)): Enforcement_Profile property connectionOptimizationService value: "none' is invalid

## Changed
- CHARON-307: Use node:14-alpine docker base image

## Removed

## 1.12.0

## Added
- CHARON-218: Use logger package instead of console.log
- CHARON-256: Allow files up to 1GB to be processed by REST API

## Fixed
- CHARON-254: ([GitHub Issue 23](https://github.com/f5devcentral/f5-automation-config-converter/issues/23)): Fix AS3 schema parsing for Service_Forwarding class
- CHARON-268: Do not attach persistenceMethods to the Service_Forwarding class.
- CHARON-261: ([GitHub Issue 24](https://github.com/f5devcentral/f5-automation-config-converter/issues/24)): Fix certificate reference path for TLS_Server

## Changed

## Removed

## 1.11.0

### Added
- CHARON-172: AS3 doesn't recognize ltm monitors

### Fixed
- CHARON-176: ([GitHub Issue 12](https://github.com/f5devcentral/f5-automation-config-converter/issues/12)): Fix detection of Service_HTTPS redirect80 setting and hide redundant Service_HTTP redirect
- CHARON-179: ([Github Issue 14](https://github.com/f5devcentral/f5-automation-config-converter/issues/14)): ACC doesn't like the ltm pool /tenant_2/application_2/Pool due to monitor min 1
- CHARON-180: ([Github Issue 9](https://github.com/f5devcentral/f5-automation-config-converter/issues/9)): Incorrect use of /Common/Shared/snat-pool
- CHARON-182: ([Github Issue 15](https://github.com/f5devcentral/f5-automation-config-converter/issues/15)): HTTPS cert/key/chain reference missing in the ACC output due to /Common/Shared
- CHARON-202: ([Github Issue 18](https://github.com/f5devcentral/f5-automation-config-converter/issues/18)): ACC returns an empty certificate object for certificates other than default one
- CHARON-223: ([Github Issue 8](https://github.com/f5devcentral/f5-automation-config-converter/issues/8)): Remark field should match format \"f5remark\"
- CHARON-235: AWS Service Discovery not getting detected by ACC

### Changed
- CHARON-181: ([GitHub Issue 11](https://github.com/f5devcentral/f5-automation-config-converter/issues/11)): Hide default AS3 values by default, use showExtended option to show defaults

### Removed

## 1.10.0

### Fixed
- CHARON-173: datagroup not getting converted using ACC

### Changed
- CHARON-148: "dereference" the defaults-from property
- CHARON-155: Complete API endpoint for ACC
- CHARON-158: Add support for Service Discovery iAPP and pool member labels
- CHARON-162: Use applicationAllowlist instead for applicationWhitelist AS3.25
- CHARON-169: Update Schema version in generated AS3 to the latest 3.25.0
- CHARON-164: Use ACC project name

## 1.9.0

### Fixed
- CHARON-143: Invalid conversion of LTM nodes
- CHARON-144: LTM pool with app-service supported incorrectly and not converted

### Changed
- CHARON-145: Egress support added for http2 profile AS3.24
- CHARON-146: Support httpMrfRoutingEnabled AS3.24
- CHARON-149: Update Schema version in generated AS3 to the latest 3.24.0

## 1.8.0

## Fixed
- CHARON-133: Fix reference to objects in iRule

## Changed
- CHARON-128: Support ports configuration in protocol-inspection profile configuration added in AS3.23
- CHARON-129: Add profileNTLM to Service_HTTP and Service_HTTPS classes added to AS3.23
- CHARON-130: Monitor_MySQL class added to AS3.23
- CHARON-131: Update Schema version in generated AS3 to the latest 3.23.0
- CHARON-137: Handle "allowVlans"
- CHARON-138: Log with recognized and supported objects from configuration

## 1.7.0

### Fixed
- CHARON-105: DOS_Profile botSignatures must use 'bigip' keyword
- CHARON-106: [TLS Encryption] Ignoring validation of certificates when retrieving URI data not converted
- CHARON-107: [TLS Encryption] Using multiple SSL/TLS certificates in a single profile failed after convertion due characters
- CHARON-108: [TLS Encryption] Using multiple SSL/TLS certificates in a single profile failed after convertion due referencing of certificates and keys
- CHARON-109: [TLS Encryption] Using matchToSNI with a TLS_Server profile failed conversion
- CHARON-110: [TLS Encryption] Using PKCS 12 in a declaration failed conversion
- CHARON-115: [HTTP Services] "profileHTTPCompression": "basic", is not converted
- CHARON-117: [HTTP Services] profile '/Common/mptcp-mobile-optimized' is not covered
- CHARON-120: Fix 'security dos profile' remarks
- CHARON-125: Failed to convert GSLB_Domain with multiple pools

### Changed
- CHARON-124: Encode iRules to base64 to avoid special symbols handling

## 1.6.0

### Fixed
- CHARON-85: Converted existing port 80 redirect virtual servers without adding redirect80: false to the corresponding HTTPS virtual servers- which causes AS3 failures.
- CHARON-111: Enabling and disabling clientSSL (server SSL profile) from Endpoint policies failed conversion

### Changed
- CHARON-37: Support for DNS Cache Config added in AS3.13
- CHARON-93: Add a custom name feature to GSLB Virtual Servers AS3.21
- CHARON-94: Add cacheTimeout for TLS_Client and TLS_Server AS3.21
- CHARON-95: Add serviceDownImmediateAction to Services AS3.21
- CHARON-96: NAT translation exclusion addresses AS3.21
- CHARON-97: Support for user-defined properties for ASM security log profiles AS3.16

## 1.5.0

### Fixed
- CHARON-82: security dos profile conversion fails if 'vectors' empty
- CHARON-86: Converted multiple-client ssl profiles attached to a virtual server to just one client-ssl profile attached to a virtual server. **Limited support in AS3 refered in README.md Important notes**
- CHARON-87: On virtual servers with no persistence profile, ACC does not add the persistenceMethods": [] element to keep persistence disabled.
- CHARON-88: clientside tcp profile lost when converting Virtual with clinteside and serverside profiles
- CHARON-89: Update duplicate objects section in the FAQ

### Changed
- CHARON-58: Support timer policies ('net timer-policy') to services via policyIdleTimeout property. AS3.19
- CHARON-77: Add support for negative policy operands added in AS3.17
- CHARON-79: Add maximumBandwidth to Services added in AS3.19
- CHARON-80: Add the option to specify the value of the Service_Core translateClientPort property as a string (as well as a boolean) and added the additional setting 'preserve-strict'. added in AS3.19

## 1.4.0

### Fixed
- CHARON-52: If pool has duplicate name object and isn't used in any virtual it replace all pools in all virtuals
- CHARON-50: replace 48 characters limit on object names with 194 for the path
- CHARON-51: Filter by application fails when parsing iRules
- CHARON-45: Incorrect Security_Log_Profile name if spaces in original name.
- CHARON-65: "default_cert" "class": "Certificate" not created when exporting /Common/default.crt

### Changed
- CHARON-36: Support VLANS as Firewall Rules Source added in AS3.15
- CHARON-38: Support for references to FTP Profiles added in AS3.14
- CHARON-39: Support ability to create ICAP profiles added in AS3.16
- CHARON-44: Support Security_Log_Profile_Bot_Defense
- CHARON-54: Support for attaching Bot-Defense profiles to a Service added in AS3.17
- CHARON-55: Support for creating Protocol Inspection profiles added in AS3.17
- CHARON-56: Support IP Forwarding Service added in AS3.18
- CHARON-57: Support TLS options added in AS3.19
- CHARON-59: Support to reference bandwidth control policies from services via policyBandwidthControl property added in AS3.19
- CHARON-60: Support for creating cipher rules added in AS3.17
- CHARON-62: Support to reference cipher groups from TLS profiles added in AS3.17
- CHARON-63: Support action 'forward' for Endpoint_Policy

## 1.3.0

### Fixed
- CHARON-43: Security_Log_Profile conversion fails if application name != undefined
- CHARON-47: Support configurations when object located in /Partition/Application and the linked object located in /Common/Shared/ or in /Partition/Shared

### Changed
- CHARON-32: Support for HTTP2 Profile for Service_HTTPS added in AS3.13
- CHARON-33: Support for attaching client TLS to HTTPS Monitor added in AS3.13
- CHARON-34: Support creation of internal VS added in AS3.16
- CHARON-35: Support Analytics TCP Profile added in AS3.14

## 1.2.0

### Fixed
- CHARON-5: Fix property-handling for monitors
- CHARON-14: UnhandledPromiseRejectionWarning: Error: ENOENT: no such file or directory, scandir '.extract/config'
- CHARON-18: Readme not clear about UCS/SCF file location
- CHARON-24: "security log profile" /security.js:17: Expected string, but array received
- CHARON-26: Monitor parsing fails
- CHARON-27: virtual-address not in default application, takes application name as object name
- CHARON-29: /shared added to certificate even if it was in shared already.

### Changed
- CHARON-4: Intelligently handle duplicate named objects
- CHARON-9: VS/Tenant-based AS3 declarations
- CHARON-21: Specify tenant and application name
- CHARON-22: Always use shareNodes
- CHARON-23: Filter output by "Application"
- CHARON-19: Enable support for "." and "-" characters in declaration output

## 1.1.0

### Fixed
#168: Fatal error: security 'agent-action'
#169: Pool: member service_port is occasionally NaN
#178: Monitor receive should be a string
#179: References to iRules from Persistence profiles does not account for /Common/Shared

### Changed
#151: Report Object name collisions

## 1.0.0

### Changed
Added support for a large number of AS3 classes

## 0.9.0
- Initial release
