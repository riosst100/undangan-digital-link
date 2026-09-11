<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTemplateRequest;
use App\Http\Resources\Admin\TemplateResource;
use App\Models\Template;
use App\Models\TemplateVersion;
use App\Services\Templates\TemplateSchemaValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    public function store(StoreTemplateRequest $request, TemplateSchemaValidator $schemaValidator): JsonResponse
    {
        $sections = collect($request->input('sections'))
            ->map(fn (array $section) => [
                'type' => $section['type'],
                'variant' => $section['variant'],
                'enabled' => $section['enabled'] ?? true,
                'settings' => [],
            ])
            ->values()
            ->all();

        $schema = $schemaValidator->validate([
            'name' => $request->string('name')->toString(),
            'version' => 1,
            'sections' => $sections,
        ]);

        $template = DB::transaction(function () use ($request, $schema) {
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
                'schema' => $schema,
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
