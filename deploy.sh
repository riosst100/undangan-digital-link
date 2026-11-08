#!/usr/bin/env bash
# Production deploy: pull the latest master, rebuild images, restart. Run from this folder.
# Wrapped in { } so bash reads the whole script before `git merge` can replace this file.
{
set -euo pipefail
cd "$(dirname "$0")"
git fetch --prune origin master
git merge --ff-only origin/master
# Build first: if it fails, the running containers keep serving the old version.
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d --remove-orphans
# Code is bind-mounted and OPcache never re-checks files: restart PHP so it loads the new code
# (the entrypoint also runs composer install + migrations).
docker compose -f docker-compose.prod.yml restart backend
docker image prune -f >/dev/null
echo "Deployed undangan-digital $(git rev-parse --short HEAD)"
exit
}
