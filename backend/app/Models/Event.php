<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'invitation_id', 'type', 'title', 'date', 'start_time', 'end_time',
        'timezone', 'venue_name', 'address', 'maps_url', 'description', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
