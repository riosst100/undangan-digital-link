#!/bin/sh
# Production entrypoint: install deps, migrate, cache config, then start PHP-FPM.
set -e
cd /app
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views \
    storage/logs storage/app/public bootstrap/cache
[ -f .env ] || cp .env.example .env

composer install --no-dev --optimize-autoloader --no-interaction --no-progress --prefer-dist

until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME:-undangan_app}" >/dev/null 2>&1; do sleep 1; done

grep -qE '^APP_KEY=base64' .env || php artisan key:generate --force
[ -L public/storage ] || php artisan storage:link || true

php artisan migrate --force
php artisan optimize:clear
php artisan optimize

exec "$@"
