#!/usr/bin/env bash
set -euxo pipefail
cd "$(dirname "$0")/.."

# Load environment variables from .env file
if [ -f .env ] && [ -z "${CI-}" ]; then
 export $(grep -v '^#' .env | xargs)
fi

pnpm directus-sdk-typegen -u "$DIRECTUS_URL" -t "$ADMIN_TOKEN" -o ./src/utils/directus-schema.ts
