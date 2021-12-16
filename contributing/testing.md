# Testing

### Running the Tests
```
npm run test
```

### Converter Tests
The converter features are tested in two different ways. First, example declarations were used to generate the substrate .conf or .ucs (when certs involved) files. The converter will take the input file, and generate a declaration. This output is then compared to the declaration that was used to generate the config state. There are instances where the BIG-IP config is either more and less verbose than the original declaration, so there will be instances where the generated declaration is either more or less verbose than the original declaration as well. The other way that the output is testing is by using the AS3 and DO schema validation components to assert valid test outputs.


### Nightly Updates
The nightly job that checks the latest version of AUTOTOOL project deps such as AS3 and DO schemas and corresponding validators. If there is a difference between the AS3 artifactory and the ACC develop-branch, the job will commit and push the updated file. This job uses a SSH deploy key (Settings -> Repository -> Deploy Keys) injected as an environmental variable to gain write-access and push the new commit to the ACC repo.
