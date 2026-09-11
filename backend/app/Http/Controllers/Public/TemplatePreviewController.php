<?php

namespace App\Http\Controllers\Public;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;

class TemplatePreviewController extends Controller
{
    use ApiResponses;

    /**
     * Returns a template's published section schema plus its matching
     * theme's tokens, for rendering a demo preview with placeholder
     * couple/event data — no real Invitation record involved. Templates
     * and themes are paired 1:1 by slug (see Admin\TemplateController@store).
     */
    public function show(string $slug): JsonResponse
    {
        $template = Template::where('slug', $slug)->where('is_active', true)->with('versions')->first();

        if (! $template) {
            return $this->fail('Template tidak ditemukan.', 404);
        }

        $templateVersion = $template->versions->where('status', 'published')->sortByDesc('version')->first();

        if (! $templateVersion) {
            return $this->fail('Template belum memiliki versi yang dipublikasikan.', 404);
        }

        $theme = Theme::where('slug', $slug)->where('is_active', true)->with('versions')->first();
        $themeVersion = $theme?->versions->where('status', 'published')->sortByDesc('version')->first();

        if (! $themeVersion) {
            return $this->fail('Template belum memiliki tema.', 404);
        }

        return $this->success([
            'name' => $template->name,
            'slug' => $template->slug,
            'sections' => $templateVersion->schema['sections'] ?? [],
            'theme' => $themeVersion->tokens,
        ]);
    }
}
