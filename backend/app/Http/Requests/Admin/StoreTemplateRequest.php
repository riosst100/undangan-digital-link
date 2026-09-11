<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sectionTypes = config('templates.section_types');
        $fonts = config('templates.fonts');
        $animationPresets = config('templates.animation_presets');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'alpha_dash', 'max:100', 'unique:templates,slug'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'integer', 'min:0'],
            'tier' => ['required', Rule::in(['standard', 'exclusive'])],
            'thumbnail_url' => ['nullable', 'url', 'max:2048'],

            'sections' => ['required', 'array', 'min:1'],
            'sections.*.type' => ['required', 'string', Rule::in($sectionTypes)],
            'sections.*.variant' => ['required', 'string'],
            'sections.*.enabled' => ['sometimes', 'boolean'],

            'theme.colors.primary' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.colors.secondary' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.colors.background' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.colors.surface' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.colors.text' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.colors.muted' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.typography.heading' => ['required', 'string', Rule::in($fonts)],
            'theme.typography.body' => ['required', 'string', Rule::in($fonts)],
            'theme.animations.preset' => ['required', 'string', Rule::in($animationPresets)],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $variants = config('templates.variants');
            $sections = $this->input('sections', []);

            foreach (is_array($sections) ? $sections : [] as $index => $section) {
                $type = $section['type'] ?? null;
                $variant = $section['variant'] ?? null;

                if ($type && $variant && ! in_array($variant, $variants[$type] ?? [], true)) {
                    $validator->errors()->add(
                        "sections.{$index}.variant",
                        "Variant '{$variant}' is not allowed for section type '{$type}'.",
                    );
                }
            }
        });
    }
}
