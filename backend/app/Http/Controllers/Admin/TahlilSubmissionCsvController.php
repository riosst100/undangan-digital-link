<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTahlilSubmissionRequest;
use App\Models\TahlilSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * CSV export/import of the HVS invitations list. The cover illustration is
 * not part of the CSV (an existing one is left untouched on import).
 */
class TahlilSubmissionCsvController extends Controller
{
    use ApiResponses;

    private const MAX_ROWS = 500;

    /** CSV column order; the same names are read back on import. */
    public const COLUMNS = [
        'id', 'status', 'contact_phone', 'type', 'khitan_kind', 'title', 'event_name',
        'deceased_gender', 'deceased_name', 'parent_name', 'groom_name', 'bride_name', 'child_name',
        'guest_salutation', 'date', 'time', 'timezone', 'time_note', 'venue', 'host', 'no_gifts', 'guests',
        'opening_text', 'subject_label', 'closing_text', 'salam_text', 'signoff_text',
        'recipient_label', 'schedule_intro', 'no_gifts_text',
    ];

    /** Separates guest names inside the single "guests" cell. */
    private const GUEST_SEPARATOR = ' | ';

    public function export(Request $request): StreamedResponse
    {
        $request->validate([
            'status' => ['nullable', Rule::in(TahlilSubmission::STATUSES)],
            'template' => ['nullable', 'boolean'],
        ]);

        $query = TahlilSubmission::query()
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest();
        $template = $request->boolean('template');

        $filename = ($template ? 'template-undangan-hvs' : 'undangan-hvs-'.now()->format('Ymd-His')).'.csv';

        return response()->streamDownload(function () use ($query, $template) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel reads accents correctly
            fputcsv($out, self::COLUMNS);

            if ($template) {
                fputcsv($out, $this->exampleRow());
            } else {
                foreach ($query->cursor() as $submission) {
                    fputcsv($out, $this->rowFor($submission));
                }
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'max:2048', 'mimes:csv,txt']]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        $firstLine = (string) fgets($handle);
        rewind($handle);
        $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

        $header = fgetcsv($handle, 0, $delimiter);
        if (! $header) {
            return $this->fail('File CSV kosong.', 422);
        }
        $header = array_map(fn ($name) => Str::of((string) $name)->replace("\xEF\xBB\xBF", '')->trim()->lower()->toString(), $header);
        if (! in_array('type', $header, true)) {
            return $this->fail('Kolom "type" tidak ditemukan. Unduh template CSV untuk format yang benar.', 422);
        }

        $formRequest = new StoreTahlilSubmissionRequest;
        $created = 0;
        $updated = 0;
        $errors = [];
        $line = 1;

        while (($cells = fgetcsv($handle, 0, $delimiter)) !== false) {
            $line++;
            if ($cells === [null] || count(array_filter($cells, fn ($cell) => trim((string) $cell) !== '')) === 0) {
                continue;
            }
            if ($line - 1 > self::MAX_ROWS) {
                $errors[] = ['row' => $line, 'message' => 'Dibatalkan: maksimal '.self::MAX_ROWS.' baris per file.'];
                break;
            }

            $row = $this->normaliseRow(array_combine($header, array_pad(array_slice($cells, 0, count($header)), count($header), '')));
            $validator = Validator::make($row, [...$formRequest->rules(), 'id' => ['nullable', 'uuid']], [], $formRequest->attributes());

            if ($validator->fails()) {
                $errors[] = ['row' => $line, 'message' => $validator->errors()->first()];

                continue;
            }

            $data = $validator->validated();
            $id = $data['id'] ?? null;
            unset($data['id']);

            $existing = $id ? TahlilSubmission::find($id) : null;
            if ($existing) {
                $existing->update($data);
                $updated++;
            } else {
                TahlilSubmission::create([...$data, 'status' => $data['status'] ?? 'diproses']);
                $created++;
            }
        }
        fclose($handle);

        return $this->success(['created' => $created, 'updated' => $updated, 'errors' => $errors]);
    }

    /** @return list<string|int> */
    private function rowFor(TahlilSubmission $submission): array
    {
        return array_map(fn (string $column) => match ($column) {
            'date' => $submission->date?->format('Y-m-d'),
            'no_gifts' => $submission->no_gifts ? 'ya' : 'tidak',
            'guests' => implode(self::GUEST_SEPARATOR, $submission->guests ?? []),
            default => $submission->{$column},
        }, self::COLUMNS);
    }

    /** @return list<string> */
    private function exampleRow(): array
    {
        $example = [
            'id' => '', 'status' => 'diproses', 'contact_phone' => '081234567890', 'type' => 'tahlil', 'khitan_kind' => '',
            'title' => 'UNDANGAN', 'event_name' => 'Tahlil 100 Hari', 'deceased_gender' => 'P', 'deceased_name' => 'Ibu Tarsem',
            'parent_name' => 'Surma', 'guest_salutation' => 'Bapak/Saudara', 'date' => '2026-11-08', 'time' => '16:00',
            'timezone' => 'WIB', 'time_note' => 'Ba’da Ashar', 'venue' => 'Rumah Almh. Ibu Tarsem', 'host' => 'Bpk Kono - Ibu Tuti',
            'no_gifts' => 'ya', 'guests' => 'Bapak Ahmad | Ibu Siti',
        ];

        return array_map(fn (string $column) => $example[$column] ?? '', self::COLUMNS);
    }

    /**
     * @param  array<string, string|null>  $row
     * @return array<string, mixed>
     */
    private function normaliseRow(array $row): array
    {
        $row = array_map(fn ($value) => trim((string) $value), array_intersect_key($row, array_flip(self::COLUMNS)));
        $row = array_map(fn ($value) => $value === '' ? null : $value, $row);

        if (array_key_exists('no_gifts', $row)) {
            $row['no_gifts'] = ! in_array(Str::lower((string) $row['no_gifts']), ['tidak', 'no', 'false', '0', 'n'], true);
        }
        if (array_key_exists('guests', $row)) {
            $row['guests'] = $row['guests'] === null
                ? []
                : array_values(array_filter(array_map('trim', preg_split('/\s*\|\s*|\R/', $row['guests'])), fn ($name) => $name !== ''));
        }
        foreach (['type', 'khitan_kind', 'status', 'timezone', 'deceased_gender'] as $key) {
            if (isset($row[$key])) {
                $row[$key] = $key === 'timezone' || $key === 'deceased_gender' ? Str::upper($row[$key]) : Str::lower($row[$key]);
            }
        }
        if (isset($row['contact_phone'])) {
            $digits = preg_replace('/[\s\-().]/', '', $row['contact_phone']);
            $row['contact_phone'] = preg_replace('/^(\+?62)/', '0', $digits);
        }
        if (isset($row['date']) && preg_match('#^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$#', $row['date'], $m)) {
            $row['date'] = sprintf('%04d-%02d-%02d', $m[3], $m[2], $m[1]); // dd/mm/yyyy as typed in Excel
        }
        if (isset($row['time']) && preg_match('/^\d{1}:\d{2}$/', $row['time'])) {
            $row['time'] = '0'.$row['time'];
        }

        return $row;
    }
}
