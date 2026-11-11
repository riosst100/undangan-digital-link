<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * Tahlil invitation data sent from the public form, reviewed and turned
 * into a PDF by an admin.
 */
class TahlilSubmission extends Model
{
    use HasUuid;

    public const TYPES = ['tahlil', 'pernikahan', 'khitan'];

    public const STATUSES = ['baru', 'diproses', 'selesai'];

    protected $fillable = [
        'contact_phone', 'illustration', 'opening_text', 'subject_label', 'closing_text', 'salam_text', 'signoff_text', 'recipient_label', 'schedule_intro', 'no_gifts_text', 'type', 'khitan_kind', 'groom_name', 'bride_name', 'child_name', 'title', 'event_name', 'deceased_gender', 'deceased_name', 'parent_name',
        'guest_salutation', 'date', 'time', 'timezone', 'time_note', 'venue', 'host',
        'no_gifts', 'guests', 'status',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'no_gifts' => 'boolean',
            'guests' => 'array',
        ];
    }

    /** Guest names are stored trimmed, without blank lines. */
    protected static function booted(): void
    {
        static::saving(function (self $submission) {
            $submission->guests = array_values(array_filter(
                array_map(fn ($name) => trim((string) $name), $submission->guests ?? []),
                fn ($name) => $name !== '',
            ));
        });
    }

    /**
     * The stored fields in the shape TahlilInvitationPdf::render() expects.
     *
     * @return array<string, mixed>
     */
    public function toPdfInput(): array
    {
        return [
            ...$this->only([
                'illustration', 'opening_text', 'subject_label', 'closing_text', 'salam_text', 'signoff_text', 'recipient_label', 'schedule_intro', 'no_gifts_text',
                'type', 'khitan_kind', 'groom_name', 'bride_name', 'child_name', 'title', 'event_name', 'deceased_gender', 'deceased_name', 'parent_name', 'guest_salutation',
                'time', 'timezone', 'time_note', 'venue', 'host', 'no_gifts',
            ]),
            'date' => $this->date->format('Y-m-d'),
            'guests' => $this->guests ?? [],
        ];
    }
}
