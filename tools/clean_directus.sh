#!/usr/bin/env bash
set -euxo pipefail
cd "$(dirname "$0")/../directus"

docker compose down -v
docker compose create
