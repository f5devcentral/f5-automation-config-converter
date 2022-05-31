#!/bin/bash
set -x

# shellcheck disable=SC1091
source "$(dirname "${BASH_SOURCE[0]}")/update-util.sh"

validate_env_vars

# Update deps to latest using npm-check-updates
# exlude ajv (version pinned by AS3/DO)
npx npm-check-updates -u -x ajv
npm i
npm upgrade

set_git_user_config

git checkout "$CI_BRANCH_NAME"
git remote set-url origin https://"$ACC_ACCESS_TOKEN"@"$CI_SERVER_HOST"/"$CI_PROJECT_PATH".git

commit_changes "ACC" "$UPDATE_BRANCH_NAME"

# Set context back to reference branch
git checkout "$CI_BRANCH_NAME"
