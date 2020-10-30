---
name: Bug report
about: Report a defect in the product
title: ''
labels: bug, untriaged
assignees: ''

---

<!--
Github Issues are consistently monitored by F5 staff, but should be considered
as best effort only and you should not expect to receive the same level of
response as provided by F5 Support. Please open a case
(https://support.f5.com/csp/article/K2633) with F5 if this is a critical issue.
When filing an issue please check to see if an issue already exists that matches your's
-->

### Environment
 * Application Services Version:
 * BIG-IP Version:

### Summary
A clear and concise description of what the bug is.
Please also include information about the reproducibility and the severity/impact of the issue.

### Steps To Reproduce
Steps to reproduce the behavior:
1. Convert following config:
```conf
ltm pool /Common/just_pool {
    description "just description"
}

ltm rule /Common/validation_rule {

    when CLIENT_ACCEPTED {
         set hsludp {[HSL::open -proto UDP -pool /Common/just_pool]
    }
}
```

2. Observe the following error message:
```out
Error parsing input file. Please email us at solutionsfeedback@f5.com and include the following error:


TypeError: Cannot read property 'length' of undefined
    at groupObjects (/root/CHARON/source/src/parse.js:150:52)
    at module.exports (/root/CHARON/source/src/parse.js:251:27)
    at module.exports (/root/CHARON/source/src/main.js:51:18)
    at Object.<anonymous> (/root/CHARON/source/init:54:1)
    at Module._compile (internal/modules/cjs/loader.js:778:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:831:12)
```

### Expected Behavior
A clear and concise description of what you expected to happen.

### Actual Behavior
A clear and concise description of what actually happens.
Please include any applicable error output.
