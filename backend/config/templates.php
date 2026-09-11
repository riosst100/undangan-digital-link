<?php

// Authoritative allowlist of section types and their component variants.
// This must be kept in sync with frontend/lib/template-engine/registry.ts.
// Both admin-authored and AI-generated template configs are validated
// against this list before being saved — nothing outside it is ever
// persisted or rendered.

return [

    'section_types' => [
        'cover',
        'couple',
        'story',
        'event',
        'gallery',
        'rsvp',
        'gift',
        'music',
        'quote',
        'closing',
        'guest_greeting',
    ],

    'variants' => [
        'cover' => ['fullscreen', 'minimal', 'split'],
        'couple' => ['classic', 'editorial', 'split'],
        'story' => ['timeline', 'cards'],
        'event' => ['card', 'minimal', 'timeline'],
        'gallery' => ['masonry', 'grid', 'carousel'],
        'rsvp' => ['form', 'simple'],
        'gift' => ['default', 'tabs'],
        'music' => ['player-minimal', 'player-floating'],
        'quote' => ['default'],
        'closing' => ['default', 'signature'],
        'guest_greeting' => ['default'],
    ],

    // Allowlisted animation presets a theme may reference.
    'animation_presets' => [
        'fade',
        'fade-up',
        'fade-down',
        'fade-left',
        'fade-right',
        'zoom',
        'scale',
        'blur',
        'slide',
        'parallax',
    ],

    // Allowlisted font families (subset we bundle via next/font).
    'fonts' => [
        'Playfair Display',
        'Cormorant Garamond',
        'Inter',
        'Poppins',
        'EB Garamond',
        'Marcellus',
    ],
];
