<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiftAccount extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'invitation_id', 'bank_name', 'account_number', 'account_holder',
        'qris_media_id', 'sort_order',
    ];

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function qrisMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'qris_media_id');
    }
}
