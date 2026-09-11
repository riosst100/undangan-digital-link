<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoryItem extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = ['story_id', 'year', 'title', 'description', 'sort_order'];

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }
}
