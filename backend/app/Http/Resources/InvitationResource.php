<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvitationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'status' => $this->status,
            'template_id' => $this->template_id,
            'template_version_id' => $this->template_version_id,
            'theme_id' => $this->theme_id,
            'theme_version_id' => $this->theme_version_id,
            'share_template' => $this->share_template,
            'share_message' => $this->share_message,
            'couple' => $this->whenLoaded('couple', fn () => $this->couple ? [
                'bride_name' => $this->couple->bride_name,
                'bride_nickname' => $this->couple->bride_nickname,
                'groom_name' => $this->couple->groom_name,
                'groom_nickname' => $this->couple->groom_nickname,
            ] : null),
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
