#!/bin/bash
set -x

# shellcheck disable=SC1091
source "$(dirname "${BASH_SOURCE[0]}")/update-util.sh"

validate_env_vars

# Get latest DO dependencies from gitlab
echo "Checking for DO updates..."

cd ../ || exit 1
git clone https://"$DO_ACCESS_TOKEN"@"$CI_SERVER_HOST"/"$CI_PROJECT_ROOT_NAMESPACE"/f5-declarative-onboarding.git
cd f5-declarative-onboarding || exit 1
git checkout develop


mkdir -p ../src/lib ../src/schema/latest
cp ./src/lib/configItems.json ../src/lib/configItems.json
cp ./src/lib/ajvValidator.js ../src/lib/ajvValidator.js
cp -r ./src/schema/latest ../src/schema

cd ../f5-automation-config-converter || exit 1

set_git_user_config

git checkout "$CI_BRANCH_NAME"
git remote set-url origin https://"$ACC_ACCESS_TOKEN"@"$CI_SERVER_HOST"/"$CI_PROJECT_PATH".git


# Use git to diff the files, update, commit and push
mv ../src/lib/configItems.json autotoolDeps/DO/src/lib/configItems.json
mv ../src/lib/ajvValidator.js autotoolDeps/DO/src/lib/ajvValidator.js

cp -r ../src/schema/latest/*.js* autotoolDeps/DO/src/schema/latest

commit_changes "DO" "$UPDATE_BRANCH_NAME"

# Set context back to reference branch
git checkout "$CI_BRANCH_NAME"
