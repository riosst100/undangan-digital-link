# Architecture — undangan-digital.link

## 1. Overview

undangan-digital.link is a SaaS platform for creating beautiful, mobile-first
digital wedding invitations. The system is **not** a page builder — customers
fill in structured data (couple, events, story, gallery, RSVP, gift, music)
and the platform renders a premium invitation using a **template + theme
engine** built from reusable React components.

```text
Internet
   │
Cloudflare (CDN, DNS, TLS proxy)
   │
Nginx (reverse proxy, static assets)
   ├── Next.js  → PM2   (frontend: public invitations, customer app, admin UI)
   │
   └── Laravel  → PHP-FPM (API: auth, data, template/theme engine, AI proxy)
             │
             ├── PostgreSQL   (source of truth)
             ├── Redis        (optional: queue, cache, rate limiting)
             └── Cloudflare R2 (media storage, S3-compatible)
```

No Docker. Both dev and production run natively.

## 2. Why this split

- **Next.js** owns rendering and UX: SSR/ISR for public invitation pages
  (SEO, speed, WhatsApp link previews), client-side wizard for the customer
  dashboard, admin UI.
- **Laravel** owns business logic, persistence, authorization, and is the
  only thing that talks to the Claude API. This keeps the Claude key off the
  browser and keeps authorization enforcement server-side and centralized.
- **PostgreSQL** for relational integrity (invitations belong to customers,
  templates are versioned, RSVPs belong to guests) — a good fit given the
  strongly relational domain model.
- **Redis is optional** — introduced only when a concrete need appears
  (queueing image processing jobs, AI rate limiting, caching public
  invitation reads). Not required for MVP correctness.

## 3. Request flow examples

### Public invitation view
```
Browser (WhatsApp in-app browser)
  → Next.js /[slug] page (SSR, cached)
    → Laravel GET /api/public/invitations/{slug}
      → resolves Invitation + locked Template Version + Theme Version + content
    ← JSON
  ← HTML (SEO meta, OG tags, minimal JS)
```

### Customer editing (wizard, autosaved)
```
Browser (dashboard)
  → Next.js client component (debounced autosave)
    → Laravel PATCH /api/customer/invitations/{id}/couple (Sanctum auth)
      → FormRequest validation → Policy authorization → persist
    ← { success, data }
```

### AI content generation
```
Browser → Next.js API route (thin proxy, forwards auth cookie/token)
  → Laravel POST /api/ai/story/generate (Sanctum auth, rate limited)
    → AiServiceInterface → ClaudeAiService → Anthropic API
    ← raw model output
  → Schema validation (Zod-equivalent on PHP side / custom validator)
  → AiGeneration history record saved
  ← { success, data: { title, content } }
```

The Claude API key lives only in Laravel's `.env`, read via `config/ai.php`.
Next.js never holds it, not even in a server-only env var, to keep the trust
boundary singular and auditable.

## 4. Template/Theme engine (see docs/template-system.md for schemas)

```
Template (structure: sections, order, variants)
   +
Theme (look: colors, type, spacing, radius, shadows, animation presets)
   +
Customer content (couple, events, story, gallery, rsvp, gift, music)
   ↓
Rendering Engine (Next.js): reads section list → looks up component variant
   in a registry → renders with theme tokens as CSS variables / Tailwind config
```

Adding a template = writing JSON config, not a new page. Adding a variant =
one new React component registered under an existing section type.

## 5. Versioning model

```
Invitation
  ├── template_id            (which template family)
  ├── template_version_id    (locked at publish time)
  ├── theme_id
  └── theme_version_id       (locked at publish time)
```

Editing a template creates a new `template_versions` row; existing
invitations keep pointing at their locked version until the customer
explicitly re-publishes against a newer version (future feature — not
required for MVP, but the schema supports it from day one).

## 6. Authentication

Laravel Sanctum, SPA-style cookie authentication for the Next.js app
(same-site, first-party API under a shared apex domain in production, or
token-based for cross-origin dev). Roles: `admin`, `customer`, enforced with
Laravel Policies — never trust client-side role checks.

## 7. Monorepo layout

See docs/architecture.md §8 and the repository root for the actual tree:
`frontend/`, `backend/`, `docs/`, `scripts/`.

## 8. Deployment target

Ubuntu VPS, Nginx reverse-proxying to Next.js (PM2) and PHP-FPM (Laravel),
PostgreSQL with a dedicated non-superuser role, Cloudflare in front for
CDN/TLS, Certbot for origin certificates. See docs/deployment.md.

## 9. Non-goals (explicitly out of scope for MVP)

- Visual drag-and-drop page builder (Elementor/Canva/Figma-style)
- Microservices / Kubernetes
- Multi-region / multi-tenant DB sharding
- Docker-based dev or deploy
