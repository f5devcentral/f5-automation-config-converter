# ACC Release Process

* Ensure the develop branch is ready, and that `package.json` and `package-lock.json` have the appropriate new version number.

* Create either a new tag or branch. If this is a release, create a tag e.g. `1.X.X`.

* Collect the artifacts from the pipeline run. `build docs` will produce a pdf from the docs. `docker image` will produce a consumable docker image in a .tar.gz file. These files are also published to Artifactory both as a .tar.gz file, as well as pullable Docker image. The image filename should have the following format: `f5-automation-config-converter-1.X.X.tar.gz`. NOTE: Develop and main branches do NOT publish a build.

* Merge develop branch into main. Either run `git merge develop` from main, or create a merge request. You may self-approve this MR.

* Attach both the pdf and docker image to the GitHub release. Include any relevant notes. [Releases](https://github.com/f5devcentral/f5-automation-config-converter/releases)

* In order to publish the image to Dockerhub, you will first need to load the image.
    * `docker load -i f5-automation-config-converter-1.X.X.tar.gz`
* Next, tag the image with the version release. The first argument is the image to tag; the second is the tag to add.
    * `docker tag f5-automation-config-converter:1.X.X f5devcentral/f5-automation-config-converter:1.X.X`
* Push the tagged image to dockerhub.
    * `docker push f5devcentral/f5-automation-config-converter:1.X.X`
