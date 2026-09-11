# API Design

Base URL (dev): `http://localhost:8000/api`

## Conventions

- JSON only. Consistent envelope:
  ```json
  { "success": true, "data": {} }
  { "success": false, "message": "Unable to generate content." }
  ```
- Proper HTTP status codes (200/201/204/401/403/404/422/429/500).
- Auth: Laravel Sanctum SPA cookie auth for the Next.js app (same
  apex domain in prod: `app.undangan-digital.link` ↔
  `api.undangan-digital.link`, `SANCTUM_STATEFUL_DOMAINS` configured
  accordingly). All customer/admin routes require `auth:sanctum`.
- Authorization via Laravel Policies (e.g. `InvitationPolicy::update` checks
  `invitation.user_id === $user->id`) — never trust a client-supplied
  ownership claim.
- Validation via `FormRequest` classes at every mutating endpoint.
- Rate limiting via named throttle groups: `throttle:api` (general),
  `throttle:ai` (stricter, per-user) on all `/api/ai/*`.

## Auth
```
POST   /api/register
POST   /api/login
POST   /api/logout
POST   /api/forgot-password
POST   /api/reset-password
GET    /api/user            (current authenticated user)
```

## Customer — Invitations
```
GET    /api/customer/invitations
POST   /api/customer/invitations
GET    /api/customer/invitations/{id}
PATCH  /api/customer/invitations/{id}
DELETE /api/customer/invitations/{id}
POST   /api/customer/invitations/{id}/publish
POST   /api/customer/invitations/{id}/unpublish

PATCH  /api/customer/invitations/{id}/couple
PUT    /api/customer/invitations/{id}/events
PUT    /api/customer/invitations/{id}/story
PUT    /api/customer/invitations/{id}/gallery
PUT    /api/customer/invitations/{id}/gift
PUT    /api/customer/invitations/{id}/music

GET    /api/customer/invitations/{id}/guests
POST   /api/customer/invitations/{id}/guests
DELETE /api/customer/invitations/{id}/guests/{guestId}

GET    /api/customer/invitations/{id}/rsvps
GET    /api/customer/invitations/{id}/analytics
```

## Media
```
POST   /api/media               (multipart upload; returns media record + variants)
DELETE /api/media/{id}
```

## Public (no auth)
```
GET    /api/public/invitations/{slug}?to={guestToken}
POST   /api/public/invitations/{slug}/rsvp
POST   /api/public/invitations/{slug}/track-view
```

## AI (see docs/ai.md for payload schemas)
```
POST   /api/ai/story/generate
POST   /api/ai/story/improve
POST   /api/ai/quote/generate
POST   /api/ai/opening/generate
POST   /api/ai/closing/generate
POST   /api/ai/couple-bio/generate
POST   /api/ai/event-description/generate
POST   /api/ai/whatsapp-message/generate
```

## Admin
```
GET    /api/admin/customers
GET    /api/admin/invitations

GET    /api/admin/templates
POST   /api/admin/templates
GET    /api/admin/templates/{id}
POST   /api/admin/templates/{id}/versions
PATCH  /api/admin/templates/{id}/versions/{versionId}
POST   /api/admin/templates/{id}/versions/{versionId}/publish

GET    /api/admin/themes
POST   /api/admin/themes
POST   /api/admin/themes/{id}/versions
PATCH  /api/admin/themes/{id}/versions/{versionId}
POST   /api/admin/themes/{id}/versions/{versionId}/publish

POST   /api/admin/ai/template/generate
POST   /api/admin/ai/theme/generate
POST   /api/admin/ai/theme/modify
GET    /api/admin/ai/generations

GET    /api/admin/analytics
```

## Frontend (Next.js) route responsibilities

Next.js does **not** implement its own API for business logic; it either:
1. Server-renders by calling Laravel directly (server components/route
   handlers, credentials via httpOnly cookie forwarded), or
2. Acts as a thin proxy route handler when a browser-originated request
   needs cookie-based auth forwarding across the app/API domain split.

No Next.js route ever embeds the Claude API key or talks to Anthropic
directly.
