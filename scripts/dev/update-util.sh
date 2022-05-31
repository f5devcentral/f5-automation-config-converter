#!/bin/bash

function validate_env_vars {
    # Check branch name.  Attempt to set if possible
    if [[ -z "$CI_BRANCH_NAME" ]]; then
        CI_BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
        if [[ -z "$CI_BRANCH_NAME" ]]; then
            echo "CI_BRANCH_NAME is required"
            exit 1
        fi
        echo "CI_BRANCH_NAME set to $CI_BRANCH_NAME"
    fi

    if [[ -z "$CI_PROJECT_PATH" ]]; then
        echo "CI_PROJECT_PATH is required"
        exit 1
    fi

    if [[ -z "$CI_PROJECT_ROOT_NAMESPACE" ]]; then
        echo "CI_PROJECT_ROOT_NAMESPACE is required"
        exit 1
    fi

    if [[ -z "$CI_SERVER_HOST" ]]; then
        echo "CI_SERVER_HOST is required"
        exit 1
    fi

    if [[ -z "$ACC_ACCESS_TOKEN" ]]; then
        echo "ACC_ACCESS_TOKEN is required"
        exit 1
    fi

    if [[ -z "$AS3_ACCESS_TOKEN" ]]; then
        echo "AS3_ACCESS_TOKEN is required"
        exit 1
    fi

    if [[ -z "$DO_ACCESS_TOKEN" ]]; then
        echo "DO_ACCESS_TOKEN is required"
        exit 1
    fi

    if [[ -z "$UPDATE_BRANCH_NAME" ]]; then
        echo "UPDATE_BRANCH_NAME is required"
        exit 1
    fi
}

function set_git_user_config {
    # Only set git user config when in CI/CD context
    if [[ -n "$GITLAB_CI" ]]; then
        git config --global user.email "$RUNNER_EMAIL"
        git config --global user.name "F5 Automation Config Converter Pipeline"
    fi
}

function commit_changes {
    local project_name
    local update_branch

    if [[ $# != 2 ]]; then
        echo "Usage: ${FUNCNAME[0]} <project_name> <update_branch>"
    fi

    project_name="$1"
    update_branch="$2"

    # Check for changes
    if [ -z "$(git status --porcelain)" ]; then
        echo "No ${project_name} dependency updates detected..."
    else
        echo "${project_name} dependency updates detected!"

        # For CI/CD, signal caller to create MR
        export AUTOTOOL_DIFF=true

        # Set context to update branch
        git checkout "$update_branch" 2>/dev/null || git checkout -b "$update_branch";

        git add .
        git status
        git commit -m "Auto-update to ${project_name} deps"
    fi
}
