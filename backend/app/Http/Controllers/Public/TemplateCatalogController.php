<?php

namespace App\Http\Controllers\Public;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Resources\TemplateCatalogResource;
use App\Models\Template;
use Illuminate\Http\JsonResponse;

class TemplateCatalogController extends Controller
{
    use ApiResponses;

    private const PER_SECTION = 8;

    public function index(): JsonResponse
    {
        $base = Template::query()->where('is_active', true)->withCount('invitations');

        $newest = (clone $base)->latest('created_at')->limit(self::PER_SECTION)->get();

        $bestSellers = (clone $base)
            ->orderByDesc('invitations_count')
            ->get()
            ->filter(fn (Template $template) => $template->invitations_count > 0)
            ->take(self::PER_SECTION)
            ->values();

        $exclusive = (clone $base)
            ->where('tier', 'exclusive')
            ->latest('created_at')
            ->limit(self::PER_SECTION)
            ->get();

        return $this->success([
            'newest' => TemplateCatalogResource::collection($newest),
            'best_sellers' => TemplateCatalogResource::collection($bestSellers),
            'exclusive' => TemplateCatalogResource::collection($exclusive),
        ]);
    }
}
