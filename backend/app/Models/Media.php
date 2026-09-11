<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'owner_id', 'disk', 'path', 'original_filename', 'mime_type',
        'size_bytes', 'width', 'height', 'variants',
    ];

    protected function casts(): array
    {
        return ['variants' => 'array'];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function url(): string
    {
        return \Storage::disk($this->disk)->url($this->path);
    }
}
