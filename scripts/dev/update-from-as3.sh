#!/bin/bash
set -x

# shellcheck disable=SC1091
source "$(dirname "${BASH_SOURCE[0]}")/update-util.sh"

validate_env_vars

# Get latest AS3 dependencies from gitlab
echo "Checking for AS3 updates..."

cd ../ || exit 1
git clone https://"$AS3_ACCESS_TOKEN"@"$CI_SERVER_HOST"/"$CI_PROJECT_ROOT_NAMESPACE"/f5-appsvcs.git
cd f5-appsvcs || exit 1
git checkout develop
npm ci

# Build adc-schema.json
echo "Building AS3 schema..."
node scripts/build/schema-build.js


FILES=("lib/adcParser.js" \
"lib/adcParserComponents.js" \
"lib/adcParserFormats.js" \
"lib/adcParserKeywords.js" \
"lib/config.js" \
"lib/constants.js" \
"lib/log.js" \
"lib/postProcessor.js" \
"lib/postValidator.js" \
"lib/properties.json" \
"lib/tracer.js" \
"lib/validator.js" \
"lib/util/authHeaderUtil.js" \
"lib/util/certUtil.js" \
"lib/util/cloudLibUtils.js" \
"lib/util/expandUtil.js" \
"lib/util/extractUtil.js" \
"lib/util/iappUtil.js" \
"lib/util/fetchUtil.js" \
"lib/util/util.js" \
"schema/latest/adc-schema.json"
)

# Extract specific lib, lib/util files from AS3 via cherry picking
mkdir -p ../src/lib/tag ../src/lib/util ../src/schema/latest
for F in "${FILES[@]}"; do
    cp "./src/$F" "../src/$F"
done
# Extract all lib/tag files
cp -r "./src/lib/tag" "../src/lib"


cd ../f5-automation-config-converter || exit 1

set_git_user_config

git checkout "$CI_BRANCH_NAME"
git remote set-url origin https://"$ACC_ACCESS_TOKEN"@"$CI_SERVER_HOST"/"$CI_PROJECT_PATH".git

mkdir -p autotoolDeps/AS3/src/lib/tag
mkdir -p autotoolDeps/AS3/src/lib/util
mkdir -p autotoolDeps/AS3/src/schema/latest

# Use git to diff the files, update, commit and push
for F in "${FILES[@]}"; do
    mv "../src/$F" "autotoolDeps/AS3/src/$F"
done
cp -r "../src/lib/tag" "autotoolDeps/AS3/src/lib"

commit_changes "AS3" "$UPDATE_BRANCH_NAME"

# Set context back to reference branch
git checkout "$CI_BRANCH_NAME"
