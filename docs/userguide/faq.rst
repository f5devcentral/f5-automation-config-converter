.. _faq:

Frequently Asked Questions
==========================

This page contains information and frequently asked questions on the F5 Automation Config Converter (BIG-IP ACC).

What is it and what does it do?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

CLI-based tool which converts BIG-IP configurations into BIG-IP AS3 declarations

| Input (any of the following):
* UCS file
* SCF file
* CONF file

| Output:
* Valid BIG-IP AS3 declaration stanzas (some manipulation of stanzas may be required)
* Counts and identifies both supported and unsupported configuration objects

Why did we build it?
^^^^^^^^^^^^^^^^^^^^
To have the ability to migrate installed base configurations to BIG-IP AS3 declarations as well as deploy new BIG-IPs with BIG-IP AS3.

What classes are supported?
^^^^^^^^^^^^^^^^^^^^^^^^^^^
As a rule of thumb, BIG-IP ACC provides best-effort support for BIG-IP AS3/BIG-IP DO classes EXCEPT for WAF_Policy. See :ref:`Classes<classes>` for a listing of supported classes.

Certificate Handling
^^^^^^^^^^^^^^^^^^^^

.. NOTE:: BIG-IP ACC's responsibility is not certificate management. Best practice for certificate handling is to use a certifcate management tool.

An example bigip.conf file:

::

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


::

    "theCert": {
        "class": "Certificate",
        "passphrase": {
            "ciphertext": "JE0kU0MkaDBFWVdvSzJzYWZwVkU1OElqTjdxUT09",
            "protected": "eyJhbGciOiJkaXIiLCJlbmMiOiJmNXN2In0=",
            "ignoreChanges": true
        }
    }

If the input file has the certificates and keys in /Common/ (without any subfolders), then BIG-IP ACC creates the certificate object in /Common/Shared providing references to the objects in /Common/.

If the input file has the certificates and keys in a subfolder such as /Common/< subfolder >/ or in /AS3_Tenant/AS3_Application/, for example, then BIG-IP ACC will generate BIG-IP AS3 certificates providing full certificate information such as crt, secret, passwords etc. with no reference to /Common/.

.. IMPORTANT:: 1. When the file path contains subfolders, the certificate files can only be created using .ucs files since .scf and .conf files do not contain certificate information resulting in empty certificate files.
    2. The certificate, key and chain content will be part of the BIG-IP AS3 declaration in the form of plain text.

::

    "theCert": {
        "class": "Certificate",
        "certificate": "-----BEGIN CERTIFICATE-----... -----END CERTIFICATE-----",
        "privateKey":
        "chainCA": "-----BEGIN CERTIFICATE-----....-----END CERTIFICATE-----",
        "passphrase": {
            "ciphertext": "JE0kU0MkaDBFWVdvSzJzYWZwVkU1OElqTjdxUT09",
            "protected": "eyJhbGciOiJkaXIiLCJlbmMiOiJmNXN2In0=",
            "ignoreChanges": true
        }
    }


What else do I need to know?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

* Object names over 194 characters in length will be trimmed
* Only the noted BIG-IP configuration object types are supported
* Coverage of configuration objects will increase over time
* BIG-IP ACC will be delivered via container-based packaging
* BIG-IP ACC maps /Common to /Common/Shared
* TCL iApps are not supported
* BIG-IP ACC does not support ASM/APM policy conversions

.. NOTE:: For additional information on BIG-IP ACC partition mapping, see the *When does BIG-IP AS3 write to the Common partition for LTM configurations?* section of the `BIG-IP AS3 FAQ <https://clouddocs.f5.com/products/extensions/f5-appsvcs-extension/latest/userguide/faq.html>`_.

