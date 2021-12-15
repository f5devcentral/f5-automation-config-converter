# Update deps to latest using npm-check-updates
# exlude ajv (version pinned by AS3/DO)
npx npm-check-updates -u -x ajv
npm i
npm upgrade


git config --global user.email $RUNNER_EMAIL
git config --global user.name "F5 Automation Config Converter Pipeline"

git checkout $CI_BRANCH_NAME
git remote set-url origin https://$ACC_ACCESS_TOKEN@$CI_SERVER_HOST/$CI_PROJECT_PATH.git

if [ -z "$(git status --porcelain)" ]; then
  echo "No ACC dependency updates detected..."
else
    export AUTOTOOL_DIFF=true
    echo "ACC dependency updates detected!"

    git checkout $UPDATE_BRANCH_NAME 2>/dev/null || git checkout -b $UPDATE_BRANCH_NAME;

    git add .
    git status
    git commit -m "Auto-update to ACC deps"
fi

git checkout $CI_BRANCH_NAME
