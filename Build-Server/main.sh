#!/bin/bash

# If GitHub token is provided, use it for authentication with private repos
if [ -n "$GITHUB_TOKEN" ]; then
    # Extract protocol and URL parts
    if [[ $GIT_REPOSITORY__URL == https://github.com/* ]]; then
        # Replace https://github.com with https://token@github.com
        GIT_REPOSITORY__URL="https://${GITHUB_TOKEN}@github.com${GIT_REPOSITORY__URL#https://github.com}"
    elif [[ $GIT_REPOSITORY__URL == http://github.com/* ]]; then
        # Replace http://github.com with https://token@github.com
        GIT_REPOSITORY__URL="https://${GITHUB_TOKEN}@github.com${GIT_REPOSITORY__URL#http://github.com}"
    fi
fi

git clone "$GIT_REPOSITORY__URL" /home/app/output

exec node script.js