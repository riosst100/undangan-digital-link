# Deployment — Ubuntu VPS (no Docker)

## Target architecture

```
undangan-digital.link
        │
     Cloudflare (DNS, CDN, TLS)
        │
      Nginx
   ┌────┴─────┐
   │          │
Next.js    Laravel API
 (PM2)     (PHP-FPM)
              │
         PostgreSQL (dedicated app role, not superuser)
         Redis (optional)
         Cloudflare R2 (media)
```

## Server prerequisites

```bash
sudo apt update && sudo apt install -y nginx postgresql postgresql-contrib \
  php8.3-fpm php8.3-pgsql php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip \
  php8.3-bcmath php8.3-gd unzip curl git

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pnpm pm2

curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

sudo apt install -y certbot python3-certbot-nginx
```

## Database

```bash
sudo -u postgres psql -c "CREATE ROLE undangan_app WITH LOGIN PASSWORD 'CHANGE_ME';"
sudo -u postgres psql -c "CREATE DATABASE undangan_digital OWNER undangan_app;"
```

Never run the app as the `postgres` superuser. Grant only what's needed on
the app database.

## Backend (Laravel)

```bash
cd /var/www/undangan-digital/backend
composer install --no-dev --optimize-autoloader
cp .env.example .env   # fill real values
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

PHP-FPM pool + Nginx `fastcgi_pass` to the pool socket; standard Laravel
public/ document root.

## Frontend (Next.js via PM2)

```bash
cd /var/www/undangan-digital/frontend
pnpm install --frozen-lockfile
pnpm build
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow printed instructions to enable on boot
```

`ecosystem.config.js` lives at `frontend/ecosystem.config.js`.

## Nginx

Two server blocks (or one with path-based routing):
- `app.undangan-digital.link` → proxy_pass to Next.js (PM2, port 3000)
- `api.undangan-digital.link` → PHP-FPM via Laravel `public/index.php`

Enable gzip/brotli, set `client_max_body_size` high enough for photo
uploads, and pass through `X-Forwarded-*` headers so Laravel/Next.js see the
real client IP and scheme (needed for Sanctum stateful domain checks and
secure cookies behind Cloudflare).

## TLS

Cloudflare in front (orange-cloud) with "Full (strict)" mode; Certbot issues
the origin certificate so Cloudflare↔origin is also encrypted.

```bash
sudo certbot --nginx -d app.undangan-digital.link -d api.undangan-digital.link
```

## Backups

- `pg_dump` nightly via cron to a local path + sync to R2 (or a separate
  bucket) for offsite retention.
- Document restore: `pg_restore` / `psql < dump.sql` against a freshly
  created database, then point `.env` at it for a drill.

## Zero-downtime-ish deploys (simple, no k8s)

```bash
git pull
# backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
sudo systemctl reload php8.3-fpm
# frontend
pnpm install --frozen-lockfile
pnpm build
pm2 reload ecosystem.config.js
```

## Monitoring (minimal, no extra infra required)

- `pm2 logs`, `pm2 monit` for the Next.js process
- Laravel log channel to `storage/logs/laravel.log`, rotated
- Nginx access/error logs
- Optional: Cloudflare analytics for edge-level traffic visibility
