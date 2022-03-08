# Get latest AS3 dependencies from gitlab
echo "Checking for AS3 updates..."

cd ../
git clone https://$AS3_ACCESS_TOKEN@$CI_SERVER_HOST/$CI_PROJECT_ROOT_NAMESPACE/f5-appsvcs.git
cd f5-appsvcs
git checkout develop

# Build adc-schema.json
echo "Building AS3 schema..."
node scripts/build/schema-build.js


FILES=("lib/adcParser.js" \
"lib/adcParserCheckResource.js" \
"lib/adcParserComponents.js" \
"lib/adcParserFetch.js" \
"lib/adcParserFormats.js" \
"lib/adcParserKeywords.js" \
"lib/adcParserSecrets.js" \
"lib/config.js" \
"lib/constants.js" \
"lib/log.js" \
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
"lib/util/util.js" \
"schema/latest/adc-schema.json"
)

# Extract files from AS3
mkdir -p ../src/lib/util ../src/schema/latest
for F in ${FILES[@]}; do
    cp "./src/$F" "../src/$F"
done


cd ../f5-automation-config-converter

git config --global user.email $RUNNER_EMAIL
git config --global user.name "F5 Automation Config Converter Pipeline"

git checkout $CI_BRANCH_NAME
git remote set-url origin https://$ACC_ACCESS_TOKEN@$CI_SERVER_HOST/$CI_PROJECT_PATH.git


# Use git to diff the files, update, commit and push
for F in ${FILES[@]}; do
    mv "../src/$F" "autotoolDeps/AS3/src/$F"
done


if [ -z "$(git status --porcelain)" ]; then
  echo "No AS3 changes detected..."
else
    export AUTOTOOL_DIFF=true
    echo "AS3 changes detected!"

    git checkout $UPDATE_BRANCH_NAME 2>/dev/null || git checkout -b $UPDATE_BRANCH_NAME;

    git add .
    git status
    git commit -m "Auto-update to AS3 files"
fi

git checkout $CI_BRANCH_NAME
