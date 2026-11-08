<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TahlilSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'contact_phone' => $this->contact_phone,
            ...$this->toPdfInput(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
