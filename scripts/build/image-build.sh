#!/bin/bash

set -e

# Use commit tag to set image tag and TEEM key
if [[ "$CI_COMMIT_TAG" ]]; then
  echo "Tagged build."
  echo "Using CI_COMMIT_TAG:${CI_COMMIT_TAG} for IMAGE_TAG."
  IMAGE_TAG=$CI_COMMIT_TAG
  if [[ -z "$TEEM_KEY_PROD" ]]; then
    echo "TEEM_KEY_PROD is required for tagged builds."
    exit 1
  fi
  echo "Using TEEM key: TEEM_KEY_PROD (masked)."
  TEEM_CONTEXT="production"
  TEEM_KEY=$TEEM_KEY_PROD
else
  echo "Untagged build."
  if [[ -z "$CI_COMMIT_REF_NAME" ]]; then
    echo "CI_COMMIT_REF_NAME is required for untagged builds."
    exit 1
  fi
  echo "Using CI_COMMIT_REF_NAME:${CI_COMMIT_REF_NAME} for IMAGE_TAG."
  IMAGE_TAG=$CI_COMMIT_REF_NAME
  if [[ -z "$TEEM_KEY_DEV" ]]; then
    echo "TEEM_KEY_DEV is required for untagged builds."
    exit 1
  fi
  echo "Using TEEM key: TEEM_KEY_DEV (masked)."
  TEEM_CONTEXT="staging"
  TEEM_KEY=$TEEM_KEY_DEV
fi

if [[ -z "$CI_PROJECT_NAME" ]]; then
  echo "CI_PROJECT_NAME is required."
  exit 1
fi

if [[ -z "$IMAGE_TAG" ]]; then
  echo "IMAGE_TAG is required."
  exit 1
fi

# Build image.
export TEEM_KEY
DOCKER_BUILDKIT=1 \
docker build --no-cache \
--secret id=TEEM_KEY \
--build-arg TEEM_CONTEXT="$TEEM_CONTEXT" \
-t "${CI_PROJECT_NAME}:${IMAGE_TAG}" .

# Export image as .tar.gz
mkdir -p dist
docker save "${CI_PROJECT_NAME}:${IMAGE_TAG}" |
  gzip -c > "dist/${CI_PROJECT_NAME}-${IMAGE_TAG}.tar.gz"
