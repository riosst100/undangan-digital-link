# Template & Theme System

## Principle

A template defines **structure** (which sections, in what order, using which
component variant). A theme defines **appearance** (colors, type, spacing,
radius, shadows, animation presets). Customer content is neither — it's the
data poured into whatever structure+appearance is selected.

```
Template Version (jsonb: sections[])
        +
Theme Version (jsonb: tokens)
        +
Invitation content (couple, events, story, gallery, rsvp, gift, music)
        ↓
Next.js Rendering Engine
```

## Template JSON Schema

```json
{
  "name": "Elegant Gold",
  "version": 1,
  "sections": [
    { "type": "cover",   "variant": "fullscreen", "enabled": true, "settings": {} },
    { "type": "couple",  "variant": "classic",    "enabled": true, "settings": {} },
    { "type": "story",   "variant": "timeline",   "enabled": true, "settings": {} },
    { "type": "event",   "variant": "card",       "enabled": true, "settings": {} },
    { "type": "gallery", "variant": "masonry",    "enabled": true, "settings": { "columns": 2 } },
    { "type": "rsvp",    "variant": "form",       "enabled": true, "settings": {} },
    { "type": "gift",    "variant": "default",    "enabled": true, "settings": {} },
    { "type": "closing", "variant": "default",    "enabled": true, "settings": {} }
  ]
}
```

Rules:
- `type` must be one of the registered section types (allowlist, see below).
- `variant` must be a registered variant for that `type` (allowlist).
- `settings` is a small, per-variant-validated bag of primitive values only
  (numbers, strings, booleans) — never arbitrary code or markup.
- Unknown `type`/`variant` combinations are rejected at save time (used for
  both admin-authored and AI-generated templates).

### Registered section types & example variants (extensible)

```
cover    : fullscreen | minimal | split
couple   : classic | editorial | split
story    : timeline | cards
event    : card | minimal | timeline
gallery  : masonry | grid | carousel
rsvp     : form | simple
gift     : default | tabs
music    : player-minimal | player-floating
quote    : default
closing  : default | signature
guest_greeting : default
```

The authoritative allowlist lives in code (`frontend` component registry +
mirrored `backend` validation config), not only in this doc — see
`backend/config/templates.php` and `frontend/lib/template-engine/registry.ts`.

## Theme JSON Schema

```json
{
  "name": "Elegant Gold",
  "version": 1,
  "colors": {
    "primary": "#C9A86A",
    "secondary": "#E8DCC8",
    "background": "#FBF7F0",
    "surface": "#FFFFFF",
    "text": "#302C27",
    "muted": "#81786E"
  },
  "typography": {
    "heading": "Playfair Display",
    "body": "Inter"
  },
  "spacing": { "unit": 4 },
  "radius": { "card": "16px", "button": "999px" },
  "shadows": { "card": "0 8px 24px rgba(0,0,0,0.08)" },
  "animations": { "preset": "fade-up" }
}
```

Validation: colors must be valid hex; typography values must be from an
allowlisted font set (Google Fonts subset we bundle); animation preset must
be one of the registered presets (§38 of master spec: fade, fade-up,
fade-down, fade-left, fade-right, zoom, scale, blur, slide, parallax).

## Versioning & locking

- Editing a template/theme in the admin never mutates a version in place
  once it has `status = published` — it creates a new version row.
- `invitations.template_version_id` / `theme_version_id` are set at publish
  time and never silently repointed. A customer must explicitly opt in to
  "update to latest version" (future feature; schema already supports it).

## Rendering engine (frontend)

```
frontend/lib/template-engine/
  registry.ts        // type -> variant -> React component map
  render-section.tsx // given a section config + theme + content, renders it
  theme-provider.tsx // turns theme tokens into CSS variables
```

Each section component receives:
```ts
{ variant, settings, theme, content }
```
and is responsible only for its own layout; it must not reach outside its
props for data.
