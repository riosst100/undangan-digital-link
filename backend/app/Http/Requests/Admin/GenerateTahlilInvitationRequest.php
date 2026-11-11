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
            'type' => ['required', 'in:tahlil,pernikahan,khitan'],
            'khitan_kind' => ['required_if:type,khitan', 'nullable', 'in:sinoman,sedekah'],
            'groom_name' => ['required_if:type,pernikahan', 'nullable', 'string', 'max:40'],
            'bride_name' => ['required_if:type,pernikahan', 'nullable', 'string', 'max:40'],
            'child_name' => ['required_if:type,khitan', 'nullable', 'string', 'max:60'],
            'opening_text' => ['nullable', 'string', 'max:300'],
            'subject_label' => ['nullable', 'string', 'max:40'],
            'closing_text' => ['nullable', 'string', 'max:300'],
            'salam_text' => ['nullable', 'string', 'max:60'],
            'signoff_text' => ['nullable', 'string', 'max:60'],
            'recipient_label' => ['nullable', 'string', 'max:30'],
            'schedule_intro' => ['nullable', 'string', 'max:60'],
            'no_gifts_text' => ['nullable', 'string', 'max:40'],
            'illustration' => [
                'nullable', 'string',
                function (string $attribute, mixed $value, Closure $fail) {
                    if (! preg_match('#^data:image/(png|jpeg);base64,([A-Za-z0-9+/=]+)$#', (string) $value, $m)
                        || ($bytes = base64_decode($m[2], true)) === false
                        || strlen($bytes) > 1_500_000
                        || @getimagesizefromstring($bytes) === false) {
                        $fail('Ilustrasi harus berupa gambar PNG/JPEG maksimal 1,5 MB.');
                    }
                },
            ],
            'title' => ['required', 'string', 'max:30'],
            'event_name' => ['required', 'string', 'max:40'],
            'deceased_gender' => ['required_if:type,tahlil', 'nullable', 'in:L,P'],
            'deceased_name' => ['required_if:type,tahlil', 'nullable', 'string', 'max:60'],
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
            'type' => 'jenis undangan',
            'khitan_kind' => 'jenis undangan khitan',
            'groom_name' => 'nama mempelai pria',
            'bride_name' => 'nama mempelai wanita',
            'child_name' => 'nama anak',
            'title' => 'judul undangan',
            'illustration' => 'ilustrasi',
            'opening_text' => 'kalimat pembuka',
            'subject_label' => 'kata penghubung',
            'closing_text' => 'kalimat penutup',
            'salam_text' => 'salam penutup',
            'recipient_label' => 'kata “Kepada Yth”',
            'schedule_intro' => 'kalimat pengantar jadwal',
            'no_gifts_text' => 'teks tanpa kondangan',
            'signoff_text' => 'kata “Hormat Kami”',
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
