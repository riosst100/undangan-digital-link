# undangan-digital.link

Digital wedding invitation SaaS. Customers fill in their wedding details and
the platform renders a premium, mobile-first invitation from a
template + theme engine — no page building required.

## Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Framer Motion — `frontend/`
- **Backend**: Laravel, Sanctum, REST API — `backend/`
- **Database**: PostgreSQL
- **Storage**: Cloudflare R2 (S3-compatible)
- **AI**: Anthropic Claude API, proxied exclusively through Laravel
- **Deploy**: Ubuntu VPS — Nginx, PM2 (Next.js), PHP-FPM (Laravel). No Docker.

## Documentation

- [Architecture](docs/architecture.md)
- [Database / ERD](docs/database.md)
- [Template & Theme System](docs/template-system.md)
- [API Design](docs/api.md)
- [AI System](docs/ai.md)
- [Deployment](docs/deployment.md)

## Local development

### Prerequisites

- Node.js LTS + pnpm (`npm install -g pnpm`)
- PHP 8.2+ + Composer
- PostgreSQL 15+
- (Optional) Redis

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# configure DB_* in .env, then:
php artisan migrate
php artisan serve
```

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

Frontend runs at `http://localhost:3000`, backend API at
`http://localhost:8000`.

## Repository layout

```text
undangan-digital/
├── frontend/    Next.js app (public invitations, customer dashboard, admin)
├── backend/     Laravel API (auth, data, template/theme engine, AI proxy)
├── docs/        Architecture and design documentation
├── scripts/     Deployment/ops helper scripts
└── .env.example Root-level reference for shared/deploy env vars
```

## Core principle

Adding a new invitation template should never require a new page
implementation — only a template JSON config + theme JSON config, built from
existing reusable components. See [docs/template-system.md](docs/template-system.md).
