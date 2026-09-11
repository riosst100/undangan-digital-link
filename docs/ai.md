# AI System

## Principle

AI is an assistant, not the architecture. It never executes code and never
produces values outside a validated allowlist. The deterministic application
always stays in control:

```
User → UI → Laravel → AiServiceInterface → ClaudeAiService → Anthropic API
                                                    ↓
                                        Schema validation + allowlist check
                                                    ↓
                                        ai_generations history record
                                                    ↓
                                        Validated structured result → UI
```

## Abstraction

```php
interface AiServiceInterface {
    public function generate(string $feature, array $input): AiGenerationResult;
}

class ClaudeAiService implements AiServiceInterface { ... }
```

Provider is selected via `config('ai.provider')`. Adding OpenAI/Gemini later
means implementing the interface — no business logic changes.

## Endpoints (Laravel, Sanctum-protected, rate-limited)

```
POST /api/ai/story/generate
POST /api/ai/story/improve
POST /api/ai/quote/generate
POST /api/ai/opening/generate
POST /api/ai/closing/generate
POST /api/ai/couple-bio/generate
POST /api/ai/event-description/generate
POST /api/ai/whatsapp-message/generate

# Admin-only:
POST /api/admin/ai/template/generate
POST /api/admin/ai/theme/generate
POST /api/admin/ai/theme/modify
```

## Request/response shape

Request (story/generate example):
```json
{
  "couple": { "bride": "Amel", "groom": "Rio" },
  "story": {
    "meeting": "bertemu di kampus",
    "relationship": "mulai dekat setelah sering mengerjakan tugas bersama",
    "engagement": "lamaran pada 2025"
  },
  "tone": "romantic",
  "language": "id"
}
```

Response:
```json
{ "success": true, "data": { "title": "Awal Kisah Kami", "content": "..." } }
```

Improve endpoint additionally accepts `action` (one of: more_romantic,
more_elegant, shorten, lengthen, more_casual, more_emotional, fix_grammar)
and returns the generated alternative alongside the original — the frontend
never auto-overwrites; user picks "Gunakan / Coba Lagi / Batal".

## Tone presets (allowlist)

```
romantic, elegant, simple, warm, casual, formal, modern, islamic,
emotional, minimalist
```

## Validation pipeline

```
Claude raw output (expected JSON)
   ↓ parse (reject on malformed JSON)
   ↓ schema validation (required fields, types, max length)
   ↓ allowlist check (tone, language, component/variant names for
     template/theme generation)
   ↓ persist ai_generations row (prompt, input, output, status)
   ↓ return to caller
```

Template/theme generation additionally passes through the same
section-type/variant/token allowlist used for admin-authored
templates/themes (`backend/config/templates.php`, `theme` validators) — the
AI cannot introduce a component or token key that doesn't already exist in
code.

## Cost & reliability controls

- Only called on explicit user action (Generate/Improve/Rewrite/Regenerate)
  — never on keystroke or autosave.
- Per-user rate limiting (Laravel throttle middleware) on all `/api/ai/*`
  routes.
- Max input length enforced per feature (prevents prompt-stuffing cost
  abuse).
- Output length capped; Claude call has a timeout with a single retry on
  transient failure, then a clean error.
- Errors are normalized to a generic, friendly message
  ("AI sedang sibuk. Silakan coba lagi beberapa saat lagi.") — raw
  provider errors/stack traces are never returned to the client.

## Security

- `CLAUDE_API_KEY` exists only in `backend/.env`, read via
  `config/ai.php`. Never referenced by any Next.js code, never sent to the
  browser in any form (including server-only Next.js env vars — Laravel is
  the sole caller).
- Next.js AI-related routes, if any, are pure proxies that forward the
  authenticated request to Laravel; they hold no provider credentials.
