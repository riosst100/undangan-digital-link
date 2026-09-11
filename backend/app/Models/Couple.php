<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Couple extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'invitation_id',
        'bride_name', 'bride_nickname', 'bride_parents', 'bride_photo_media_id', 'bride_bio',
        'groom_name', 'groom_nickname', 'groom_parents', 'groom_photo_media_id', 'groom_bio',
    ];

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function bridePhoto(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'bride_photo_media_id');
    }

    public function groomPhoto(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'groom_photo_media_id');
    }
}
