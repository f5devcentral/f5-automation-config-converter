.. _faq:

Frequently Asked Questions
==========================

This page contains information and frequently asked questions on the F5 Automation Config Converter (ACC).

What is it and what does it do?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

CLI-based tool which converts BIG-IP configurations into AS3 declarations

| Input (any of the following):
* UCS file
* SCF file
* CONF file

| Output:
* Valid AS3 declaration stanzas (some manipulation of stanzas may be required)
* Counts and identifies both supported and unsupported configuration objects

Why did we build it?
^^^^^^^^^^^^^^^^^^^^
To have the ability to migrate installed base configurations to AS3 declarations as well as deploy new BIG-IPs with AS3.

What classes are supported?
^^^^^^^^^^^^^^^^^^^^^^^^^^^
As a rule of thumb, ACC provides best-effort support for AS3/DO classes EXCEPT for WAF_Policy. See :ref:`Classes<classes>` for a listing of supported classes.

Certificate Handling
^^^^^^^^^^^^^^^^^^^^

.. NOTE:: ACC's responsibility is not certificate management. Best practice for certificate handling is to use a certifcate management tool.

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

If the input file has the certificates and keys in /Common/ (without any subfolders), then ACC creates the certificate object in /Common/Shared providing references to the objects in /Common/.

If the input file has the certificates and keys in a subfolder such as /Common/< subfolder >/ or in /AS3_Tenant/AS3_Application/, for example, then ACC will generate AS3 certificates providing full certificate information such as crt, secret, passwords etc. with no reference to /Common/.

.. IMPORTANT:: 1. When the file path contains subfolders, the certificate files can only be created using .ucs files since .scf and .conf files do not contain certificate information resulting in empty certificate files.
    2. The certificate, key and chain content will be part of the AS3 declaration in the form of plain text.

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
* ACC will be delivered via container-based packaging
* ACC maps /Common to /Common/Shared
* TCL iApps are not supported
* ACC does not support ASM/APM policy conversions

.. NOTE:: For additional information on ACC partition mapping, see the *When does AS3 write to the Common partition for LTM configurations?* section of the `AS3 FAQ <https://clouddocs.f5.com/products/extensions/f5-appsvcs-extension/latest/userguide/faq.html>`_.

