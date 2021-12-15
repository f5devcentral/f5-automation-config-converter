# Get latest DO dependencies from gitlab
echo "Checking for DO updates..."

cd ../
git clone https://$DO_ACCESS_TOKEN@$CI_SERVER_HOST/$CI_PROJECT_ROOT_NAMESPACE/f5-declarative-onboarding.git
cd f5-declarative-onboarding
git checkout develop


mkdir -p ../src/lib ../src/schema/latest
cp ./src/lib/configItems.json ../src/lib/configItems.json
cp ./src/lib/ajvValidator.js ../src/lib/ajvValidator.js
cp -r ./src/schema/latest ../src/schema

cd ../f5-automation-config-converter


git config --global user.email $RUNNER_EMAIL
git config --global user.name "F5 Automation Config Converter Pipeline"

git checkout $CI_BRANCH_NAME
git remote set-url origin https://$ACC_ACCESS_TOKEN@$CI_SERVER_HOST/$CI_PROJECT_PATH.git


# Use git to diff the files, update, commit and push
mv ../src/lib/configItems.json autotoolDeps/DO/src/lib/configItems.json
mv ../src/lib/ajvValidator.js autotoolDeps/DO/src/lib/ajvValidator.js

cp -r ../src/schema/latest/*.js* autotoolDeps/DO/src/schema/latest


if [ -z "$(git status --porcelain)" ]; then
  echo "No DO changes detected..."
else
    export AUTOTOOL_DIFF=true
    echo "DO changes detected!"

    git checkout $UPDATE_BRANCH_NAME 2>/dev/null || git checkout -b $UPDATE_BRANCH_NAME;

    git add .
    git status
    git commit -m "Auto-update to DO files"
fi

git checkout $CI_BRANCH_NAME
