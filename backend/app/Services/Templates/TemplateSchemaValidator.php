<?php

namespace App\Services\Templates;

use Illuminate\Validation\ValidationException;

/**
 * Validates a template config (admin-authored OR AI-generated) against the
 * allowlist in config/templates.php. Nothing outside that allowlist is ever
 * persisted or rendered — see docs/template-system.md and master spec §24.
 */
class TemplateSchemaValidator
{
    /**
     * @param  array<string, mixed>  $config
     * @return array<string, mixed> the validated config
     *
     * @throws ValidationException
     */
    public function validate(array $config): array
    {
        $sectionTypes = config('templates.section_types');
        $variants = config('templates.variants');

        if (empty($config['name']) || ! is_string($config['name'])) {
            $this->reject('Template name is required.');
        }

        if (! isset($config['sections']) || ! is_array($config['sections']) || empty($config['sections'])) {
            $this->reject('Template must define at least one section.');
        }

        foreach ($config['sections'] as $index => $section) {
            if (! is_array($section) || empty($section['type']) || empty($section['variant'])) {
                $this->reject("Section at index {$index} is malformed.");
            }

            $type = $section['type'];
            $variant = $section['variant'];

            if (! in_array($type, $sectionTypes, true)) {
                $this->reject("Unknown section type: {$type}");
            }

            if (! in_array($variant, $variants[$type] ?? [], true)) {
                $this->reject("Unknown variant '{$variant}' for section type '{$type}'.");
            }

            if (isset($section['settings']) && ! $this->isPrimitiveBag($section['settings'])) {
                $this->reject("Section '{$type}' settings must contain only primitive values.");
            }
        }

        return $config;
    }

    private function isPrimitiveBag(mixed $value): bool
    {
        if (! is_array($value)) {
            return false;
        }

        foreach ($value as $item) {
            if (! is_scalar($item) && ! is_null($item)) {
                return false;
            }
        }

        return true;
    }

    private function reject(string $message): never
    {
        throw ValidationException::withMessages(['schema' => [$message]]);
    }
}
