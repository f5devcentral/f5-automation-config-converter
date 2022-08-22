#!/bin/bash

set -e

if [[ -z "$ARTIFACTORY_URL" ]]; then
    echo "ARTIFACTORY_URL is required"
    exit 1
fi

DEP_PATH=./dependencies
NPM_INSTALL_OPTS=--no-save

if [[ -z "$ACC_DEV_ENV" ]]; then
    echo "All packages from '${DEP_PATH}' will be added as dependencies to package.json and package-lock.json"
    NPM_INSTALL_OPTS=
fi

mkdir -p $DEP_PATH

npm config set @automation-toolchain:registry https://${ARTIFACTORY_URL}/artifactory/api/npm/f5-automation-toolchain-npm
npm pack --pack-destination $DEP_PATH @automation-toolchain/f5-appsvcs-schema

npm install $NPM_INSTALL_OPTS $DEP_PATH/*
