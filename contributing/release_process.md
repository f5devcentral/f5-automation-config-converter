# ACC Release Process

## Prepare to create the release branch

* Autotool dependencies (Package updates, AS3/DO updates)
    * Determine if the update_autotool_deps branch exists in the repository.  If the branch exists, it indicates that there are outstanding autotool dependencies to merge.
    * If there are outstanding autotool depependencies, review the associated pipeline(s) to determine if there are any issues to resolve.  Resolve any issues and push the changes to the update_autotool_deps branch.
    * When there are no issues, create a MR to merge update_autotools_deps to develop.
    * Review/Approve the MR and merge to develop.
    * The update_autotool_deps job runs nightly and for merges to develop.  Confirm that there are no new changes picked up by the update_autotool_deps job that runs due to the merge to develop above.  If there are new changes, repeat the process above.

* Confirm that the latest pipeline run in develop branch is clean.
* Review files in develop branch to confirm version number and changes are correct:
    * CHANGELOG.md
    * SUPPORT.md
    * package.json
    * package-lock.json

## Create the release branch

* Create a release branch named after the release (e.g. `1.X.X`) based on main.
* Merge from develop into the release branch (squash history to avoid leaking history `git merge --squash develop`).
    * merge conflicts (VS Code has a conflict resolution UI.  In most cases you will choose `Accept Incoming Change`.)
    * merge mistakes 
        * git will try to automerge all files.
        * git may automerge portions of a file where there are conflicts.
        * git automerge doesn't always work as expected.  No conflicts doesn't mean no errors.
        * It is wise to diff the release branch to develop after locally committing the merge (`git diff develop 1.X.X`).
* Create a merge request to merge the release branch into main.

## Merge the release branch into main

* Do not delete the release branch as a part of the merge.  It will be used as a basis for any point releases.
* Merging the release branch into main will kick off a pipeline.
* Confirm that this pipeline is clean.

## Merge the release branch into develop (optional)

* If there were changes made to the release branch after merging from develop, merge these changes back to develop.

## Create the release

* Create the release via Project overview / Releases / New Release (button).
* The tag name should match the release format (e.g. `1.X.X`).
* Create from the main branch.
* Release title should use the release format with a 'v' in front of it (e.g. `v1.X.X`).
* Creating a tag will run a new pipeline that will build a docker image using the release tag as the image tag.
* Confirm that this pipeline is clean.
* Scan the associated docker image for vulnerabilities (`docker scan <image>:<image-tag>`). DockerHub will scan the image after the Release Manager has uploaded it.  The earlier we know that we have an issue the better.

## Internal Release Announcement Email

After the release has been merged to main, send an internal release announcement email.

### Recipients
* acc_dev
* Journeys
* Ben Gordon
* Pawel Purc
* Roman Jouhannet

### Boilerplate Content

ACC v1.X.X is now available.
If you have comments or concerns, please send an email to solutionsfeedback@f5.com

### Links Content

* Link to artifactory source tarball
* Link to GitLab release page

### Dynamic Content

* Cut and paste the contents of GitLab release text with
    * Version
    * Added
    * Fixed
    * Changed
    * Removed


## Notify Release Manager that the release is ready

* The Release Manager will publish to:
    * GitHub
    * DockerHub

## Post Release

* Update the following files in develop to reflect the next release version:
    * CHANGELOG.md
    * SUPPORT.md
    * package.json
    * package-lock.json
