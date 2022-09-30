.. _install:

Installing F5 BIG-IP Automation Config Converter (BIG-IP ACC)
=============================================================

Installing BIG-IP ACC can be completed 2 ways; either by performing a docker pull or by downloading the .tar file then using docker load.
Whichever method you use, Docker must first be installed using the information in the **Note** below.

Docker pull method
^^^^^^^^^^^^^^^^^^

``docker pull f5devcentral/f5-automation-config-converter:latest``

Download method
^^^^^^^^^^^^^^^

 1. Download the .tar file from the **Assets** section on the **Releases** tab of the `GitHub repo <https://github.com/f5devcentral/f5-automation-config-converter/releases/>`_.
    It is recommended to install the latest version listed.

 2. Load the image using the following command, replacing x.x.x with the version of BIG-IP ACC you are installing: ``docker load -i f5-automation-config-converter-x.x.x.tar.gz``

.. NOTE:: Docker must be installed prior to using BIG-IP ACC.  See `Docker Desktop <https://docs.docker.com/desktop/>`_ for information on installing Docker.