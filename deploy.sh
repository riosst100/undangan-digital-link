#!/usr/bin/env bash
# Production deploy: pull the latest master and the images CI built, restart. Run from this folder.
# GitHub Actions builds and pushes the images (ghcr.io) and sends a short-lived token on stdin so this
# server only pulls them: no build here, no build RAM spike, no build cache. Run by hand (no token on
# stdin), it builds the images locally as before.
# Wrapped in { } so bash reads the whole script before `git merge` can replace this file.
{
set -euo pipefail
cd "$(dirname "$0")"
dc() { docker compose -f docker-compose.prod.yml "$@"; }
git fetch --prune origin master
git merge --ff-only origin/master

# stdin from CI: line 1 = GitHub user, line 2 = token.
user=""; token=""
[ -t 0 ] || { IFS= read -r -t 10 user && IFS= read -r -t 10 token; } || true
if [ -n "$token" ]; then
  # Throwaway login: the token never lands in ~/.docker/config.json.
  DOCKER_CONFIG="$(mktemp -d)"; export DOCKER_CONFIG
  trap 'rm -rf "$DOCKER_CONFIG"' EXIT
  printf '%s' "$token" | docker login ghcr.io -u "$user" --password-stdin >/dev/null
  dc pull backend frontend
else
  # Build first: if it fails, the running containers keep serving the old version.
  dc build
fi
dc up -d --no-build --remove-orphans
# Code is bind-mounted and OPcache never re-checks files: restart PHP so it loads the new code
# (the entrypoint also runs composer install + migrations).
dc restart backend
docker image prune -f >/dev/null
echo "Deployed undangan-digital $(git rev-parse --short HEAD)"
exit
}
