#!/bin/bash

set -e

# Determine image tag
if [[ ${CI_COMMIT_TAG} ]]; then
  IMAGE_TAG=$CI_COMMIT_TAG
else
  IMAGE_TAG=$CI_COMMIT_REF_NAME
fi

# Build image.
DOCKER_BUILDKIT=1 \
docker build --no-cache \
--secret id=TEEM_KEY \
-t $CI_PROJECT_NAME:$IMAGE_TAG .

# Export image as .tar.gz
mkdir -p dist
docker save $CI_PROJECT_NAME:$IMAGE_TAG |
  gzip -c > dist/$CI_PROJECT_NAME-$IMAGE_TAG.tar.gz
