.. _troubleshooting:

Troubleshooting BIG-IP ACC
==========================

Use this section to read about common troubleshooting steps associated with BIG-IP ACC.

Object Name Collisions (_dup)
-----------------------------

Although there are instances where BIG-IP will tolerate multiple objects with the same name (e.g. a Pool and Service both named /Common/testItem), these objects do not meet the BIG-IP AS3 validation schema.
As a result, the converter will add _dup to duplicate object name and will handle the object's properties and dependencies.
Due to the large number of BIG-IP AS3 supported objects, it is difficult to convert all objects with duplicate names.

| Objects with beginning with alpha numeric values will be renamed to: <type>_<object>_<dup>
| Objects beginning with numeric values such as ipaddress, will be renamed to: <type>_<object>
|
| Currently supported BIG-IP AS3 objects:
| ltm pool
| ltm profile
| ltm virtual
| ltm rule
| ltm policy
| ltm monitor
|
| Currently supported numeric values:
| ltm virtual
| ltm pool
| ltm monitor


.. NOTE:: This list may be extended on request. If a non-supported object has been found, simply notify and skip any identically named objects.

Due to the more-restrictive BIG-IP AS3 schema, there are two transformations applied to object names while they are being converted.
Each transformation has the potential to introduce new collisions.

.. seealso:: `BIG-IP AS3 Schema Reference <https://clouddocs.f5.com/products/extensions/f5-appsvcs-extension/latest/refguide/schema-reference.html>`_ for more information.

Error response from daemon: Drive has not been shared
-----------------------------------------------------

| If you are using Windows, and you receive a message such as:
| *Error response from daemon: Drive has not been shared.*,
| *Error loading conf/SCF file, please check the filepath.*, or
| *Error extracting specified UCS, please check the file path.*
| You may need to share the drive or update your shared drive credentials.
| Go to the Docker Desktop application and click the **Shared Drives** tab.  Verify the drive you are executing the command on is shared.
| Whenever your Windows password changes, you need to click **Reset credentials**, reselect the shared drive, click **Apply**, and re-enter your credentials.
|
.. NOTE:: Windows commands are for the Windows Command prompt (cmd) and do **not** work on Powershell.


| If you are using RHEL or SELinux, you may need to use `:Z` on the mount directory.
| For example: ``docker run --rm -v "$PWD":/app/data:Z -p 8080:8080 f5-automation-config-converter:1.0.0  serve``


| The BIG-IP ACC container runs as the "node" user, not as root. This can prevent BIG-IP ACC from having permissions to create a new file outside of the container.
| Create the output file prior to running BIG-IP ACC and change the permissions on it.
| **Note:** This will open read/write permissions on the output file.
|
* ``touch output.json``
* ``chmod a+rw output.json``
* Convert declaration as normal.
https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#non-root-user
