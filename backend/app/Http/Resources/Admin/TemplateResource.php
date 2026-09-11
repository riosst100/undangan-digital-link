<?php

namespace App\Http\Resources\Admin;

use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'price' => $this->price,
            'tier' => $this->tier,
            'thumbnail_url' => $this->thumbnail_url,
            'invitations_count' => $this->whenCounted('invitations'),
            'latest_version' => $this->whenLoaded('versions', function () {
                $latest = $this->versions->sortByDesc('version')->first();

                return $latest ? [
                    'id' => $latest->id,
                    'version' => $latest->version,
                    'status' => $latest->status,
                    'schema' => $latest->schema,
                ] : null;
            }),
            'theme' => $this->matchingThemeTokens(),
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Templates and themes are created 1:1 by the admin "create template"
     * flow, keyed by the same slug. There's no formal FK between them (an
     * invitation locks its own template_version_id/theme_version_id
     * independently), so this is a display-only convenience lookup.
     */
    private function matchingThemeTokens(): ?array
    {
        $theme = Theme::where('slug', $this->slug)->with('versions')->first();
        $latestVersion = $theme?->versions->sortByDesc('version')->first();

        return $latestVersion?->tokens;
    }
}
