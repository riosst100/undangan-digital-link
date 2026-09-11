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

    private const EXCLUSIVE_LIMIT = 8;

    public function index(): JsonResponse
    {
        $base = Template::query()->where('is_active', true)->withCount('invitations');

        $allDesigns = (clone $base)->latest('created_at')->get();

        // Fewer times used = rarer = more exclusive, so ascending order.
        $exclusive = (clone $base)
            ->where('tier', 'exclusive')
            ->orderBy('invitations_count')
            ->limit(self::EXCLUSIVE_LIMIT)
            ->get();

        return $this->success([
            'all' => TemplateCatalogResource::collection($allDesigns),
            'exclusive' => TemplateCatalogResource::collection($exclusive),
        ]);
    }
}
