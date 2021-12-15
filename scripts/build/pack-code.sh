#!/bin/bash

set -e

# npm pack uses version from package.json
PACKAGE_VERSION=$(node -p -e "require('./package.json').version")

# Determine image tag
if [[ ${CI_COMMIT_TAG} ]]; then
  IMAGE_TAG=$CI_COMMIT_TAG
else
  IMAGE_TAG=$CI_COMMIT_REF_NAME
fi

npm pack

mkdir -p dist
cp $CI_PROJECT_NAME-$PACKAGE_VERSION.tgz dist/$CI_PROJECT_NAME-$IMAGE_TAG-source.tgz
