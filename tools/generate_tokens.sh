#!/usr/bin/env bash
set -euxo pipefail
cd "$(dirname "$0")/.."

# Load environment variables from .env file
if [ -f .env ] && [ -z "${CI-}" ]; then
 export $(grep -v '^#' .env | xargs)
fi

# set tokens
ADMIN_TOKEN=$(curl -sS -X POST --retry 10 --retry-all-errors --retry-delay 2\
    "$DIRECTUS_URL/auth/login" -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | grep \
    -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

sed -i "s/^ADMIN_TOKEN=\"[^\"]*\"/ADMIN_TOKEN=\"$ADMIN_TOKEN\"/" .env
