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
use Illuminate\Support\Facades\DB;

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
}
