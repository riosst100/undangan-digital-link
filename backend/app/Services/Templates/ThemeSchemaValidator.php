<?php

namespace App\Services\Templates;

use Illuminate\Validation\ValidationException;

/**
 * Validates a theme config (admin-authored OR AI-generated) against the
 * allowlist in config/templates.php. See docs/template-system.md.
 */
class ThemeSchemaValidator
{
    private const HEX_COLOR = '/^#[0-9a-fA-F]{6}$/';

    /**
     * @param  array<string, mixed>  $config
     * @return array<string, mixed> the validated config
     *
     * @throws ValidationException
     */
    public function validate(array $config): array
    {
        if (empty($config['name']) || ! is_string($config['name'])) {
            $this->reject('Theme name is required.');
        }

        $colors = $config['colors'] ?? null;
        $requiredColorKeys = ['primary', 'secondary', 'background', 'surface', 'text', 'muted'];

        if (! is_array($colors)) {
            $this->reject('Theme colors are required.');
        }

        foreach ($requiredColorKeys as $key) {
            if (empty($colors[$key]) || ! preg_match(self::HEX_COLOR, $colors[$key])) {
                $this->reject("Color '{$key}' must be a valid hex value.");
            }
        }

        $typography = $config['typography'] ?? null;
        $allowedFonts = config('templates.fonts');

        if (! is_array($typography) || empty($typography['heading']) || empty($typography['body'])) {
            $this->reject('Theme typography (heading, body) is required.');
        }

        foreach (['heading', 'body'] as $key) {
            if (! in_array($typography[$key], $allowedFonts, true)) {
                $this->reject("Font '{$typography[$key]}' is not allowed.");
            }
        }

        if (isset($config['animations']['preset'])) {
            $allowedPresets = config('templates.animation_presets');

            if (! in_array($config['animations']['preset'], $allowedPresets, true)) {
                $this->reject("Animation preset '{$config['animations']['preset']}' is not allowed.");
            }
        }

        return $config;
    }

    private function reject(string $message): never
    {
        throw ValidationException::withMessages(['schema' => [$message]]);
    }
}
