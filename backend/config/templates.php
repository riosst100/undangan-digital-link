<?php

// Authoritative allowlist of section types and their component variants.
// This must be kept in sync with frontend/lib/template-engine/registry.ts.
// Both admin-authored and AI-generated template configs are validated
// against this list before being saved — nothing outside it is ever
// persisted or rendered.

return [

    // Only lists section types/variants that have a real React component in
    // frontend/lib/template-engine/registry.ts. Keep this in lockstep with
    // that file — an entry here with no matching component would let admins
    // save a template that silently renders nothing for that section.
    'section_types' => [
        'cover',
        'couple',
        'event',
        'story',
        'gallery',
        'rsvp',
        'gift',
        'quote',
        'guest_greeting',
        'closing',
    ],

    'variants' => [
        'cover' => ['fullscreen', 'minimal', 'arch'],
        'couple' => ['classic', 'split', 'overlap'],
        'event' => ['card', 'timeline', 'ornate'],
        'story' => ['timeline'],
        'gallery' => ['grid', 'masonry'],
        'rsvp' => ['form'],
        'gift' => ['default'],
        'quote' => ['default'],
        'guest_greeting' => ['default'],
        'closing' => ['default'],
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
