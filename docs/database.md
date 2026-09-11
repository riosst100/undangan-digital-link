# Database — undangan-digital.link (PostgreSQL)

## Design notes

- Primary keys: UUID (`uuid` v4, generated app-side via Laravel) for all
  customer-facing/public-referenceable entities (invitations, guests) since
  they appear in URLs/tokens and must not leak sequential info. Internal-only
  lookup/config tables (templates, themes, roles) may use bigint identity —
  we use UUID everywhere for consistency and simplicity, at negligible cost
  at this scale.
- Soft deletes (`deleted_at`) on: `users`, `invitations`, `templates`,
  `themes`, `guests` — customer data that admins may need to restore.
- All tables have `created_at` / `updated_at`.
- Foreign keys are enforced at the DB level; cascading deletes only within an
  invitation's owned sub-resources (events, story items, gallery items,
  guests, rsvps) — never cascade across a template/theme (those are
  reference data, protected by `restrict`).

## Entity groups

### Identity
- **users** — id (uuid), name, email (unique), password, role (enum: admin,
  customer), email_verified_at, timestamps, deleted_at
- Sanctum's `personal_access_tokens` table (standard, for API tokens if
  needed alongside SPA cookie auth)

### Template engine (reference data, admin-managed)
- **templates** — id, name, slug (unique), description, is_active,
  created_by, timestamps, deleted_at
- **template_versions** — id, template_id (fk), version (int), schema (jsonb
  — the sections config), status (enum: draft, published, archived),
  created_by, timestamps
  - unique (template_id, version)
- **themes** — id, name, slug (unique), description, is_active, created_by,
  timestamps, deleted_at
- **theme_versions** — id, theme_id (fk), version (int), tokens (jsonb —
  colors/typography/spacing/radius/shadows/animations), status, created_by,
  timestamps
  - unique (theme_id, version)

### Invitations (customer-owned)
- **invitations** — id (uuid), user_id (fk → users), slug (unique, used in
  public URL), template_id (fk), template_version_id (fk), theme_id (fk),
  theme_version_id (fk), status (enum: draft, published, unpublished),
  published_at, timestamps, deleted_at
- **couples** — id, invitation_id (fk, unique — 1:1), bride_name,
  bride_nickname, bride_parents, bride_photo_media_id (fk → media, nullable),
  bride_bio, groom_name, groom_nickname, groom_parents,
  groom_photo_media_id (fk → media, nullable), groom_bio, timestamps
- **events** — id, invitation_id (fk), type (enum: akad, resepsi,
  engagement, other), title, date, start_time, end_time, timezone, venue_name,
  address, maps_url, description, sort_order, timestamps
- **stories** — id, invitation_id (fk, unique — 1:1 container), title,
  timestamps
- **story_items** — id, story_id (fk), year, title, description, sort_order,
  timestamps
- **galleries** — id, invitation_id (fk, unique — 1:1 container), timestamps
- **gallery_items** — id, gallery_id (fk), media_id (fk → media), caption,
  sort_order, timestamps
- **rsvps** — id, invitation_id (fk), guest_id (fk → guests, nullable —
  allows anonymous RSVP if invitation permits), attendance (enum: attending,
  not_attending, maybe), guest_count, message, timestamps
- **guests** — id (uuid), invitation_id (fk), name, token (unique, for
  personalized URL `?to=` resolution and RSVP/analytics correlation),
  guest_count_hint, opened_at, timestamps, deleted_at
- **gift_accounts** — id, invitation_id (fk), bank_name, account_number,
  account_holder, qris_media_id (fk → media, nullable), sort_order,
  timestamps
- **music** — id, invitation_id (fk, unique — 1:1), media_id (fk → media,
  nullable), title, artist, autoplay_requested (bool), timestamps

### Media (shared library, S3/R2-backed)
- **media** — id (uuid), owner_id (fk → users), disk (default: r2), path,
  original_filename, mime_type, size_bytes, width, height, variants (jsonb —
  paths for webp/avif/thumbnail), timestamps, deleted_at

### AI
- **ai_generations** — id, user_id (fk), feature (enum: story_generate,
  story_improve, quote, opening, closing, couple_bio, event_description,
  whatsapp_message, template_generate, theme_generate, theme_modify),
  provider, model, prompt (text), input (jsonb), output (jsonb), status
  (enum: success, failed, rejected_validation), error_message (nullable),
  source_type (nullable, e.g. "invitation", "template"), source_id
  (nullable), version, created_at

### Commerce (schema-ready, minimal for MVP)
- **subscriptions** — id, user_id (fk), plan, status, current_period_end,
  timestamps
- **orders** — id, user_id (fk), subscription_id (fk, nullable), amount,
  currency, status, provider_reference, timestamps

### Analytics (append-only, minimal PII)
- **analytics_events** — id, invitation_id (fk), guest_id (fk, nullable),
  type (enum: view, rsvp_submit, guest_open), device, browser, referrer,
  created_at (no updated_at — immutable log)

## ERD (textual)

```
users 1───* invitations
invitations 1───1 couples
invitations 1───* events
invitations 1───1 stories 1───* story_items
invitations 1───1 galleries 1───* gallery_items
invitations 1───* rsvps
invitations 1───* guests
invitations 1───* gift_accounts
invitations 1───1 music
invitations *───1 templates
invitations *───1 template_versions
invitations *───1 themes
invitations *───1 theme_versions
templates 1───* template_versions
themes 1───* theme_versions
guests 1───* rsvps (nullable link)
media 1───* gallery_items / couples / gift_accounts / music (fk usage)
users 1───* ai_generations
invitations 1───* analytics_events
users 1───* subscriptions 1───* orders
```

## Indexing

- `invitations.slug` — unique index (public lookup hot path)
- `guests.token` — unique index (guest personalization hot path)
- `invitations.user_id`, `events.invitation_id`, `rsvps.invitation_id`,
  `analytics_events.invitation_id` — btree indexes for dashboard queries
- `ai_generations(user_id, created_at)` — for history listing
