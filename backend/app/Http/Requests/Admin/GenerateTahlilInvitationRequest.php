<?php

namespace App\Http\Requests\Admin;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class GenerateTahlilInvitationRequest extends FormRequest
{
    public const MAX_GUESTS = 200;

    public const MAX_VENUE_LINES = 2;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_name' => ['required', 'string', 'max:40'],
            'deceased_gender' => ['required', 'in:L,P'],
            'deceased_name' => ['required', 'string', 'max:60'],
            'parent_name' => ['nullable', 'string', 'max:60'],
            'guest_salutation' => ['required', 'string', 'max:30'],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'timezone' => ['required', 'in:WIB,WITA,WIT'],
            'time_note' => ['nullable', 'string', 'max:30'],
            'venue' => [
                'required', 'string', 'max:150',
                function (string $attribute, mixed $value, Closure $fail) {
                    $lines = array_filter(preg_split('/\R/', (string) $value), fn ($line) => trim($line) !== '');
                    if (count($lines) > static::MAX_VENUE_LINES) {
                        $fail('Tempat maksimal '.static::MAX_VENUE_LINES.' baris.');
                    }
                },
            ],
            'host' => ['required', 'string', 'max:60'],
            'no_gifts' => ['boolean'],
            'guests' => ['nullable', 'array', 'max:'.static::MAX_GUESTS],
            'guests.*' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * Indonesian mobile number, stored normalised to digits with a leading 0.
     *
     * @return array<int, string>
     */
    protected function contactPhoneRules(): array
    {
        return ['required', 'string', 'regex:/^08[0-9]{7,12}$/'];
    }

    /** Normalise "+62 812-3456 789" / "62812..." to "0812...". */
    protected function normaliseContactPhone(): void
    {
        if (! is_string($this->input('contact_phone'))) {
            return;
        }

        $digits = preg_replace('/[\s\-().]/', '', $this->input('contact_phone'));
        $digits = preg_replace('/^(\+?62)/', '0', $digits);

        $this->merge(['contact_phone' => $digits]);
    }

    public function messages(): array
    {
        return [
            'contact_phone.regex' => 'Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.',
        ];
    }

    public function attributes(): array
    {
        return [
            'contact_phone' => 'nomor WhatsApp',
            'status' => 'status',
            'event_name' => 'nama acara',
            'deceased_gender' => 'jenis kelamin almarhum/ah',
            'deceased_name' => 'nama almarhum/ah',
            'parent_name' => 'nama orang tua',
            'guest_salutation' => 'sapaan tamu',
            'date' => 'tanggal',
            'time' => 'pukul',
            'timezone' => 'zona waktu',
            'time_note' => 'keterangan waktu',
            'venue' => 'tempat',
            'host' => 'nama pengundang',
            'guests' => 'daftar tamu',
            'guests.*' => 'nama tamu',
        ];
    }
}
