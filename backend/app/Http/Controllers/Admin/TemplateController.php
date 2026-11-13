<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTemplateRequest;
use App\Http\Resources\Admin\TemplateResource;
use App\Models\Template;
use App\Models\TemplateVersion;
use App\Models\Theme;
use App\Models\ThemeVersion;
use App\Services\Templates\TemplateSchemaValidator;
use App\Services\Templates\ThemeSchemaValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class TemplateController extends Controller
{
    use ApiResponses;

    public function index(): JsonResponse
    {
        $templates = Template::query()
            ->withCount('invitations')
            ->with('versions')
            ->latest('created_at')
            ->get();

        return $this->success(TemplateResource::collection($templates));
    }

    public function store(
        StoreTemplateRequest $request,
        TemplateSchemaValidator $templateValidator,
        ThemeSchemaValidator $themeValidator,
    ): JsonResponse {
        $sections = collect($request->input('sections'))
            ->map(fn (array $section) => [
                'type' => $section['type'],
                'variant' => $section['variant'],
                'enabled' => $section['enabled'] ?? true,
                'settings' => [],
            ])
            ->values()
            ->all();

        $templateSchema = $templateValidator->validate([
            'name' => $request->string('name')->toString(),
            'version' => 1,
            'sections' => $sections,
        ]);

        $themeSchema = $themeValidator->validate([
            'name' => $request->string('name')->toString(),
            'version' => 1,
            'colors' => $request->input('theme.colors'),
            'typography' => $request->input('theme.typography'),
            'radius' => ['card' => '16px', 'button' => '999px'],
            'animations' => $request->input('theme.animations'),
        ]);

        $template = DB::transaction(function () use ($request, $templateSchema, $themeSchema) {
            $template = Template::create([
                'name' => $request->string('name'),
                'slug' => $request->string('slug'),
                'description' => $request->input('description'),
                'is_active' => true,
                'price' => $request->integer('price'),
                'tier' => $request->string('tier'),
                'thumbnail_url' => $request->input('thumbnail_url'),
                'created_by' => $request->user()->id,
            ]);

            TemplateVersion::create([
                'template_id' => $template->id,
                'version' => 1,
                'schema' => $templateSchema,
                'status' => 'published',
                'created_by' => $request->user()->id,
            ]);

            // Every template needs a matching theme (colors/typography/
            // animations) for an invitation to be publishable — see
            // docs/template-system.md §8. Created 1:1 here, keyed by the
            // same slug, rather than requiring a separate admin step.
            $theme = Theme::create([
                'name' => $request->string('name'),
                'slug' => $request->string('slug'),
                'is_active' => true,
                'created_by' => $request->user()->id,
            ]);

            ThemeVersion::create([
                'theme_id' => $theme->id,
                'version' => 1,
                'tokens' => $themeSchema,
                'status' => 'published',
                'created_by' => $request->user()->id,
            ]);

            return $template;
        });

        $template->loadCount('invitations')->load('versions');

        return $this->success(new TemplateResource($template), 201);
    }

    public function destroy(Template $template): JsonResponse
    {
        $template->delete();

        return $this->success(null, 204);
    }

    public function show(Template $template): JsonResponse
    {
        return $this->success(new TemplateResource($template->loadCount('invitations')->load('versions')));
    }

    public function update(Request $request, Template $template): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['sometimes', 'required', 'integer', 'min:0'],
            'tier' => ['sometimes', 'required', 'in:standard,exclusive'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $template->update($data);

        return $this->success(new TemplateResource($template->loadCount('invitations')->load('versions')));
    }

    /**
     * Visual builder save: publishes a NEW version of the template schema and
     * of its matching theme. Existing invitations keep the versions they
     * locked, so editing a design never changes already-sold invitations.
     */
    public function saveDesign(
        Request $request,
        Template $template,
        TemplateSchemaValidator $templateValidator,
        ThemeSchemaValidator $themeValidator,
    ): JsonResponse {
        $request->validate([
            'sections' => ['required', 'array', 'min:1'],
            'sections.*.type' => ['required', 'string', Rule::in(config('templates.section_types'))],
            'sections.*.variant' => ['required', 'string'],
            'sections.*.enabled' => ['sometimes', 'boolean'],
            'sections.*.settings' => ['sometimes', 'array'],
            'sections.*.settings.align' => ['sometimes', Rule::in(['left', 'center', 'right'])],
            'sections.*.settings.paddingTop' => ['sometimes', 'integer', 'between:0,300'],
            'sections.*.settings.paddingBottom' => ['sometimes', 'integer', 'between:0,300'],
            'sections.*.settings.offsetX' => ['sometimes', 'integer', 'between:-200,200'],
            'sections.*.settings.offsetY' => ['sometimes', 'integer', 'between:-200,200'],
            'sections.*.settings.container' => ['sometimes', Rule::in(['full', 'boxed'])],
            'sections.*.settings.shape' => ['sometimes', Rule::in(['square', 'rounded', 'pill', 'arch'])],
            'sections.*.settings.bgColor' => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'sections.*.settings.bgImage' => ['sometimes', 'url:http,https', 'max:2048'],
            'sections.*.settings.bgPosition' => ['sometimes', Rule::in(['center', 'top', 'bottom', 'left', 'right'])],
            'sections.*.settings.bgSize' => ['sometimes', Rule::in(['cover', 'contain'])],
            'theme.colors' => ['required', 'array'],
            'theme.colors.*' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.typography.heading' => ['required', 'string', Rule::in(config('templates.fonts'))],
            'theme.typography.body' => ['required', 'string', Rule::in(config('templates.fonts'))],
            'theme.animations.preset' => ['required', 'string', Rule::in(config('templates.animation_presets'))],
        ]);

        $sections = collect($request->input('sections'))
            ->map(fn (array $section) => [
                'type' => $section['type'],
                'variant' => $section['variant'],
                'enabled' => $section['enabled'] ?? true,
                'settings' => $this->sanitizeSettings($section['settings'] ?? []),
            ])->values()->all();

        $template->load('versions');
        $nextVersion = ($template->versions->max('version') ?? 0) + 1;

        $templateSchema = $templateValidator->validate([
            'name' => $template->name,
            'version' => $nextVersion,
            'sections' => $sections,
        ]);

        $theme = Theme::where('slug', $template->slug)->with('versions')->first();
        $currentTokens = $theme?->versions->sortByDesc('version')->first()?->tokens ?? [];

        $themeSchema = $themeValidator->validate(array_merge($currentTokens, [
            'name' => $template->name,
            'version' => ($theme?->versions->max('version') ?? 0) + 1,
            'colors' => $request->input('theme.colors'),
            'typography' => $request->input('theme.typography'),
            'animations' => $request->input('theme.animations'),
        ]));

        DB::transaction(function () use ($request, $template, $nextVersion, $templateSchema, $theme, $themeSchema) {
            TemplateVersion::create([
                'template_id' => $template->id,
                'version' => $nextVersion,
                'schema' => $templateSchema,
                'status' => 'published',
                'created_by' => $request->user()->id,
            ]);

            $theme ??= Theme::create([
                'name' => $template->name,
                'slug' => $template->slug,
                'is_active' => true,
                'created_by' => $request->user()->id,
            ]);

            ThemeVersion::create([
                'theme_id' => $theme->id,
                'version' => $themeSchema['version'],
                'tokens' => $themeSchema,
                'status' => 'published',
                'created_by' => $request->user()->id,
            ]);
        });

        return $this->success(new TemplateResource($template->loadCount('invitations')->load('versions')));
    }

    /**
     * Section-level layout keys plus per-element overrides (`el.<n>.<prop>`).
     * Anything unknown is dropped; values are clamped to safe ranges.
     */
    private function sanitizeSettings(array $settings): array
    {
        $clean = collect($settings)->only([
            'align', 'paddingTop', 'paddingBottom', 'offsetX', 'offsetY',
            'container', 'shape', 'bgColor', 'bgImage', 'bgPosition', 'bgSize',
        ])->all();

        foreach (['cols' => [1, 4]] as $field => [$min, $max]) {
            if (isset($settings[$field]) && is_numeric($settings[$field])) {
                $clean[$field] = max($min, min($max, (int) $settings[$field]));
            }
        }

        if (isset($settings['height']) && is_numeric($settings['height'])) {
            $clean['height'] = max(0, min(600, (int) $settings['height']));
        }

        foreach ($settings as $key => $value) {
            // Free-form container items: item.<n>.<col|kind|text|align>
            if (preg_match('/^item\.(\d{1,2})\.(col|kind|text|align)$/', (string) $key, $im)) {
                $item = match ($im[2]) {
                    'col' => is_numeric($value) ? max(1, min(4, (int) $value)) : null,
                    'kind' => in_array($value, ['heading', 'text', 'image'], true) ? $value : null,
                    'text' => is_string($value) ? mb_substr($value, 0, 2000) : null,
                    'align' => in_array($value, ['left', 'center', 'right'], true) ? $value : null,
                };

                if ($item !== null) {
                    $clean[$key] = $item;
                }

                continue;
            }

            if (preg_match('/^ct\\.\\d{1,2}\\.w\\d{1,2}$/', (string) $key) && is_numeric($value)) {
                $clean[$key] = max(5, min(100, (int) $value));

                continue;
            }

            if (! preg_match('/^el\.(\d{1,3})\.(x|y|mt|mb|pad|align|bg|shape|hide)$/', (string) $key, $m)) {
                continue;
            }

            $ok = match ($m[2]) {
                'x', 'y' => is_numeric($value) ? max(-400, min(400, (int) $value)) : null,
                'mt', 'mb' => is_numeric($value) ? max(0, min(300, (int) $value)) : null,
                'pad' => is_numeric($value) ? max(0, min(100, (int) $value)) : null,
                'align' => in_array($value, ['left', 'center', 'right'], true) ? $value : null,
                'shape' => in_array($value, ['rounded', 'pill', 'arch'], true) ? $value : null,
                'bg' => is_string($value) && preg_match('/^#[0-9a-fA-F]{6}$/', $value) ? $value : null,
                'hide' => $value === true ? true : null,
            };

            if ($ok !== null) {
                $clean[$key] = $ok;
            }
        }

        return $clean;
    }

    public function addImages(Request $request, Template $template): JsonResponse
    {
        $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:20'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $images = $template->images ?? [];
        foreach ($request->file('images') as $file) {
            $images[] = $file->store("templates/{$template->id}", 'public');
        }

        return $this->saveImages($template, $images);
    }

    public function removeImage(Request $request, Template $template): JsonResponse
    {
        $path = $request->validate(['path' => ['required', 'string']])['path'];
        $images = $template->images ?? [];

        if (! in_array($path, $images, true)) {
            return $this->success(new TemplateResource($template->loadCount('invitations')->load('versions')));
        }

        Storage::disk('public')->delete($path);

        return $this->saveImages($template, array_values(array_diff($images, [$path])));
    }

    private function saveImages(Template $template, array $images): JsonResponse
    {
        // The first image doubles as the catalog thumbnail.
        $template->update([
            'images' => $images,
            'thumbnail_url' => $images ? Storage::disk('public')->url($images[0]) : null,
        ]);

        return $this->success(new TemplateResource($template->loadCount('invitations')->load('versions')));
    }
}
