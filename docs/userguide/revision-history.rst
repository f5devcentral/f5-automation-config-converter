.. _revision-history:

Document Revision History
=========================

.. list-table::
      :widths: 15 100 15
      :header-rows: 1

      * - Doc Revision
        - Description
        - Date

      * - 7.0
        - **Documentation for the community-supported release of ACC, version 1.16**  |br| This release contains the following: |br| |br| Added: |br| * Added support for PostgreSQL Monitors |br| * Added handling to remove invalid declaration refs |br| |br| Fixed: |br| * Improved handling when Common is empty |br| * Fixed ltm traffic-matching-criteria fields |br| * Removed proxyCaCert, proxyCaKey and proxyCaPassphrase from TLS_Server |br| * Removed TLS_Client.trustCA if value is `none` |br| * Improved passphrase handling for Monitor class |br| * Improved handling when L4_Profile.keepAliveInterval is disabled |br| * Improved handling for HTTP_Profile.knownMethods when parser returns an object |br| |br| Changed: |br| * Use @f5devcentral/f5-teem package for usage analytics |br| * Revise safetyNet into safeMode (disables post-conversion processing)
        - 11-02-21

      * - 6.0
        - **Documentation for the community-supported release of ACC, version 1.15.1**  |br| This release contains the following: |br| |br| Fixed: |br| * Hotfix to disable legacy analytics module
        - 10-08-21

      * - 5.0
        - **Documentation for the community-supported release of ACC, version 1.15.0**  |br| This release contains the following: |br| |br| Added: |br| * Added detection for properties encrypted with SecureVault |br| * Handle Service references to Service_Address objects |br| * Added protocol-to-port number mapping |br| * Added support for rejectVlans on Services |br| |br| Fixed: |br| * Fixed certificate reference logic for individual certs |br| * Improve stability when removing default values |br| * Improve handling for TLS_Server properties |br| * Handle unprefixed profile paths |br| |br| Changed: |br| * Handle strings in Firewall_Port_List |br| * Persist comments when converting TCL or HTML to base64 |br| * Convert UCS in-memory
        - 09-21-21

      * - 4.0
        - **Documentation for the community-supported release of ACC, version 1.14.0**  |br| This release contains the following: |br| |br| Added: |br| * Add support for http2 monitor |br| * Add Windows line endings support for config files |br| * Support quoted strings with special charecters as Data_Group records values |br| * Add support for Declarative Onboarding (DO) classes (experimental/beta) |br| |br| Fixed: |br| * Virtual addresses duplicated in a virtual server
        - 08-06-21

      * - 3.0
        - **Documentation for the community-supported release of ACC, version 1.13.0**  |br| This release contains the following: |br| |br| Added: |br| * Support *waf* type for Endpoint_Policy |br| * Exit gracefully when file cannot be written |br| |br| Fixed: |br| * Incorrect use of /Shared reference for certificates under TLS_Server |br| * policyEndpoint references missing Application class name |br| * Renaming duplicated object's name results in invalid declaration |br| * Nonexistent property for Service_Generic: vlansEnabled |br| * Enforcement_Profile property connectionOptimizationService value: *none* is invalid  |br| |br| Changed: |br| * Use node:14-alpine docker base image
        - 06-25-21

      * - 2.0
        - **Documentation for the community-supported release of ACC, version 1.12.0**  |br| This release contains the following: |br| |br| Added: |br| * Use logger package instead of console.log |br| * Allow files up to 1GB to be processed by the REST API |br| |br| Fixed: |br| * `GitHub Issue 23 <https://github.com/f5devcentral/f5-automation-config-converter/issues/23>`_ Fix AS3 schema parsing for Service_Forwarding class |br| * Do not attach persistenceMethods to the Service_Forwarding class |br| * `GitHub Issue 24 <https://github.com/f5devcentral/f5-automation-config-converter/issues/24>`_ Fix certificate reference path for the TLS_Server
        - 05-18-21

      * - 1.0
        - **Documentation for the community-supported release of ACC, version 1.11.0**  |br| This release contains the following: |br| |br| Added: |br| * AS3 doesn't recognize ltm monitors |br| |br| Fixed: |br| * Fixed detection of Service_HTTPS redirect80 setting and hide redundant Service_HTTP redirect |br| * ACC doesn't like the ltm pool /tenant_2/application_2/Pool due to monitor min 1 |br| * Incorrect use of /Common/Shared/snat-pool |br| * HTTPS cert/key/chain reference missing in the ACC output due to /Common/Shared |br| * Github Issue #18): ACC returns an empty certificate object for certificates other than default one |br| * Remark field should match format "f5remark" |br| * AWS Service Discovery not getting detected by ACC |br| |br| Changed: |br| * Hide default AS3 values by default, use showExtended option to show defaults
        - 04-06-21



.. |br| raw:: html

   <br />