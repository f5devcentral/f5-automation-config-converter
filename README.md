<div align="center">

# F5 BIG-IP Automation Config Converter (BIG-IP ACC)

<a href="https://clouddocs.f5.com/products/extensions/f5-automation-config-converter/latest/">
    <img src="docs/_static/ACC_Robot.svg" alt="F5 ACC" width="200">
</a>

[Documentation](https://clouddocs.f5.com/products/extensions/f5-automation-config-converter/latest/userguide/getting_started.html) |
[Installation](https://clouddocs.f5.com/products/extensions/f5-automation-config-converter/latest/userguide/install.html) |
[Usage](https://clouddocs.f5.com/products/extensions/f5-automation-config-converter/latest/userguide/using_acc.html) |
[Classes](https://clouddocs.f5.com/products/extensions/f5-automation-config-converter/latest/userguide/classes.html) |
[FAQ](https://clouddocs.f5.com/products/extensions/f5-automation-config-converter/latest/userguide/faq.html) |
[Contributing](https://github.com/f5devcentral/f5-automation-config-converter/blob/main/SUPPORT.md)

[![docker pulls](https://img.shields.io/docker/pulls/f5devcentral/f5-automation-config-converter.svg)](https://hub.docker.com/r/f5devcentral/f5-automation-config-converter)
[![image size](https://img.shields.io/docker/image-size/f5devcentral/f5-automation-config-converter?sort=semver)](https://hub.docker.com/r/f5devcentral/f5-automation-config-converter)
[![version](https://img.shields.io/docker/v/f5devcentral/f5-automation-config-converter?sort=semver)](https://hub.docker.com/r/f5devcentral/f5-automation-config-converter)
[![github issues](https://img.shields.io/github/issues-raw/f5devcentral/f5-automation-config-converter)](https://github.com/f5devcentral/f5-automation-config-converter/issues)
[![license](https://img.shields.io/badge/license-Apache--2.0-green)](https://github.com/f5devcentral/f5-automation-config-converter/blob/main/LICENSE)

</div>

## Introduction

F5 BIG-IP Automation Config Converter (BIG-IP ACC) is an app written in Node.js that converts a BIG-IP configuration into an AS3 declaration, distributed as an easy-to-use docker image.



## Quick Start

```docker
docker pull f5devcentral/f5-automation-config-converter:latest
docker run --rm -v "$PWD":/app/data f5-automation-config-converter:latest --ucs /app/data/<your-UCS-file>.ucs
```


## Support

ACC is a community-supported offering, your feedback is greatly appreciated. If you come across a bug please [submit an issue](https://github.com/f5devcentral/f5-automation-config-converter/issues) to our team.
