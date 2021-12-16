#!/bin/bash

set -e

if [[ ${CI_COMMIT_TAG} ]]; then
  IMAGE_TAG=$CI_COMMIT_TAG
  TARGET_DIR=$IMAGE_TAG
else
  IMAGE_TAG=$CI_COMMIT_REF_NAME
  TARGET_DIR="builds/$IMAGE_TAG"
fi


# PUBLISH IMAGE AND SOURCE TO ARTIFACTORY (GENERIC REPO) #

CURL_FLAGS="--fail --retry 3 -H X-JFrog-Art-Api:$ATG_ARTIFACTORY_API_KEY"
REPO_URL="https://$ATG_ARTIFACTORY_PUBLISH_URL/artifactory/$ATG_ARTIFACTORY_GENERIC_REPO/f5-automation-config-converter/$TARGET_DIR"

# Upload to tag dir
curl $CURL_FLAGS -T "dist/$CI_PROJECT_NAME-$IMAGE_TAG.tar.gz" "$REPO_URL/$CI_PROJECT_NAME-$IMAGE_TAG.tar.gz"
curl $CURL_FLAGS -T "dist/$CI_PROJECT_NAME-$IMAGE_TAG-source.tgz" "$REPO_URL/$CI_PROJECT_NAME-$IMAGE_TAG-source.tgz"

# PUBLISH IMAGE TO ARTIFACTORY (DOCKER REPO) #

# Login to artifctory before publishing.
echo "${ATG_ARTIFACTORY_DOCKER_TOKEN}" |
docker login -u="${ATG_ARTIFACTORY_DOCKER_USER}" "${ATG_ARTIFACTORY_BASE_URL}" --password-stdin

# Load/import docker artifact.
docker load -i dist/$CI_PROJECT_NAME-$IMAGE_TAG.tar.gz

# Check if this is a tagged release.
if [[ ${CI_COMMIT_TAG} ]]; then
    docker tag $CI_PROJECT_NAME:$IMAGE_TAG $ATG_ARTIFACTORY_BASE_URL/$ATG_ARTIFACTORY_DOCKER_REPO/$CI_PROJECT_NAME:latest
fi

docker tag $CI_PROJECT_NAME:$IMAGE_TAG $ATG_ARTIFACTORY_BASE_URL/$ATG_ARTIFACTORY_DOCKER_REPO/$CI_PROJECT_NAME:$IMAGE_TAG

# Push all available tags.
docker push $ATG_ARTIFACTORY_BASE_URL/$ATG_ARTIFACTORY_DOCKER_REPO/$CI_PROJECT_NAME --all-tags
