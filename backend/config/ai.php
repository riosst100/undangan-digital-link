<?php

return [

    // Which provider implements AiServiceInterface. Adding a new provider
    // means adding a new case here + a new *AiService class — no changes
    // to controllers, requests, or the frontend.
    'provider' => env('AI_PROVIDER', 'claude'),

    'claude' => [
        'api_key' => env('CLAUDE_API_KEY'),
        'model' => env('CLAUDE_MODEL', 'claude-sonnet-5'),
        'base_url' => env('CLAUDE_API_BASE_URL', 'https://api.anthropic.com'),
        'timeout' => (int) env('CLAUDE_TIMEOUT_SECONDS', 30),
        'max_retries' => (int) env('CLAUDE_MAX_RETRIES', 1),
    ],

    // Hard caps applied before any provider call, regardless of provider.
    'limits' => [
        'max_input_chars' => (int) env('AI_MAX_INPUT_CHARS', 4000),
        'max_output_tokens' => (int) env('AI_MAX_OUTPUT_TOKENS', 1024),
    ],

    // Per-user rate limit for all /api/ai/* and /api/admin/ai/* routes.
    'rate_limit' => [
        'max_attempts' => (int) env('AI_RATE_LIMIT_MAX_ATTEMPTS', 20),
        'decay_minutes' => (int) env('AI_RATE_LIMIT_DECAY_MINUTES', 60),
    ],

    // Allowlisted tone presets for content generation. AI output tone is
    // always chosen by the user from this list — never freeform.
    'tones' => [
        'romantic',
        'elegant',
        'simple',
        'warm',
        'casual',
        'formal',
        'modern',
        'islamic',
        'emotional',
        'minimalist',
    ],

    'languages' => ['id', 'en'],

    'story_improve_actions' => [
        'more_romantic',
        'more_elegant',
        'shorten',
        'lengthen',
        'more_casual',
        'more_emotional',
        'fix_grammar',
    ],
];
