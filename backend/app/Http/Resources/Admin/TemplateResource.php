<?php

namespace App\Http\Resources\Admin;

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
            'created_at' => $this->created_at,
        ];
    }
}
