<?php

namespace App\Services\Pdf;

use Illuminate\Support\Carbon;
use Mpdf\Config\ConfigVariables;
use Mpdf\Config\FontVariables;
use Mpdf\Mpdf;

/**
 * Renders the tahlil invitation on top of the original design
 * (resources/pdf/tahlil-template.pdf: frames, ornaments, recipient box,
 * colons and the salam calligraphy, with all text removed). Every text line
 * is drawn back at the baseline, size and colour measured from the original,
 * so output with the sample data matches the reference document.
 *
 * Coordinates below are PDF points measured from the top-left of the page.
 * One page per guest when guest names are given, otherwise a single page
 * with an empty recipient box to fill in by hand.
 */
class TahlilInvitationPdf
{
    /** Template page size in points (Canva A4). */
    private const PAGE_W = 595.5;

    private const PAGE_H = 842.25;

    /** Horizontal centre of the letter card's centred lines. */
    private const LETTER_CENTER = 299.35;

    /** Widest line the letter body may use. */
    private const LETTER_MAX_W = 524.0;

    private const BODY_SIZE = 13.64;

    private const BODY_LEADING = 18.757;

    private const COVER_INK = [62, 62, 62];

    private const LETTER_INK = [91, 91, 91];

    /** "Tidak menerima kondangan" badge outline, covered when not wanted. */
    private const BADGE_RECT = [329.0, 39.0, 547.0, 64.5];

    /** Original host underline (sized to the sample name), always covered. */
    private const UNDERLINE_RECT = [226.0, 807.0, 373.0, 809.0];

    /** Usable inside of the rounded recipient box (outline spans x 338–551, y 150–232). */
    private const RECIPIENT_BOX = ['cx' => 444.5, 'cy' => 191.2, 'w' => 190.0, 'h' => 70.0];

    public const DEFAULT_CLOSING = 'Demikian undangan ini kami sampaikan, atas perhatian dan keikhlasan langkah {sapaan} untuk menghadiri undangan ini, kami ucapkan terima kasih.';

    public const DEFAULT_SALAM = 'Wassalamu’alaikum Wr.Wb';

    public const DEFAULT_SIGNOFF = 'Hormat Kami,';

    public const DEFAULT_RECIPIENT = 'Kepada Yth,';

    public const DEFAULT_SCHEDULE_INTRO = 'Yang akan dilaksanakan pada :';

    public const DEFAULT_NO_GIFTS = 'TIDAK MENERIMA KONDANGAN';

    /** Wording shown in the form by default; {sapaan} is replaced by the guest salutation. */
    public static function defaultOpening(string $type): string
    {
        $purpose = $type === 'tahlil' ? 'memberikan do’a barokah pada acara' : 'hadir pada acara';

        return 'Dengan memohon Rahmat dan Ridho Allah SWT, kami memohon dengan hormat kehadiran {sapaan} untuk '.$purpose;
    }

    public static function defaultSubjectLabel(string $type): string
    {
        return ['tahlil' => 'wafatnya:', 'pernikahan' => 'pernikahan:', 'khitan' => ':'][$type] ?? '';
    }

    /** Trimmed input value, or the default when blank. */
    private function text_or(array $input, string $key, string $default): string
    {
        $value = trim((string) ($input[$key] ?? ''));

        return $value === '' ? $default : $value;
    }

    private Mpdf $mpdf;

    /**
     * @param  array<string, mixed>  $input  validated request data
     */
    public function render(array $input): string
    {
        $data = $this->viewData($input);
        $guests = array_values(array_filter(
            array_map(fn ($name) => trim((string) $name), $input['guests'] ?? []),
            fn ($name) => $name !== '',
        ));

        $this->mpdf = $this->makeMpdf();
        $this->mpdf->SetTitle(trim('Undangan '.$data['eventName'].' '.$data['subject']));
        $this->mpdf->SetCreator(config('app.name'));

        $this->mpdf->setSourceFile(resource_path('pdf/tahlil-template.pdf'));
        $template = $this->mpdf->importPage(1);

        foreach ($guests === [] ? [null] : $guests as $guest) {
            $this->mpdf->AddPage();
            $this->mpdf->useTemplate($template, 0, 0, $this->mm(self::PAGE_W), $this->mm(self::PAGE_H));
            $this->drawCover($data, $guest);
            $this->drawLetter($data);
        }

        return $this->mpdf->Output('', 'S');
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public function viewData(array $input): array
    {
        $type = $input['type'] ?? 'tahlil';
        $female = ($input['deceased_gender'] ?? null) === 'P';
        $date = Carbon::createFromFormat('Y-m-d', $input['date'])->locale('id');
        $parentName = trim((string) ($input['parent_name'] ?? ''));
        $timeNote = trim((string) ($input['time_note'] ?? ''));

        return [
            'type' => $type,
            'illustration' => trim((string) ($input['illustration'] ?? '')) ?: null,
            'subject' => match ($type) {
                'pernikahan' => trim(trim((string) ($input['groom_name'] ?? '')).' & '.trim((string) ($input['bride_name'] ?? ''))),
                'khitan' => trim((string) ($input['child_name'] ?? '')),
                default => trim(($female ? 'Almh.' : 'Alm.').' '.trim((string) ($input['deceased_name'] ?? ''))),
            },
            'subjectLineage' => match ($type) {
                'khitan' => $parentName === '' ? null : 'Putra '.$parentName,
                'tahlil' => $parentName === '' ? null : ($female ? 'Binti ' : 'Bin ').$parentName,
                default => null,
            },
            'openingText' => $this->text_or($input, 'opening_text', self::defaultOpening($type)),
            'subjectLabel' => $this->text_or($input, 'subject_label', self::defaultSubjectLabel($type)),
            'closingText' => $this->text_or($input, 'closing_text', self::DEFAULT_CLOSING),
            'salamText' => $this->text_or($input, 'salam_text', self::DEFAULT_SALAM),
            'recipientLabel' => $this->text_or($input, 'recipient_label', self::DEFAULT_RECIPIENT),
            'scheduleIntro' => $this->text_or($input, 'schedule_intro', self::DEFAULT_SCHEDULE_INTRO),
            'noGiftsText' => $this->text_or($input, 'no_gifts_text', self::DEFAULT_NO_GIFTS),
            'signoffText' => $this->text_or($input, 'signoff_text', self::DEFAULT_SIGNOFF),
            'title' => trim((string) ($input['title'] ?? '')) ?: 'UNDANGAN',
            'eventName' => trim($input['event_name']),
            'deceasedTitle' => $female ? 'Almh.' : 'Alm.',
            'deceasedName' => trim((string) ($input['deceased_name'] ?? '')),
            'lineage' => $parentName === '' ? null : ($female ? 'Binti ' : 'Bin ').$parentName,
            'salutation' => trim($input['guest_salutation']),
            // From 18:00 the Javanese day has already turned: "Selasa malam Rabu".
            'day' => $input['time'] >= '18:00'
                ? $date->translatedFormat('l').' malam '.$date->copy()->addDay()->translatedFormat('l')
                : $date->translatedFormat('l'),
            'date' => $date->translatedFormat('j F Y'),
            'time' => str_replace(':', '.', $input['time']).' '.$input['timezone'].($timeNote === '' ? '' : ' ('.$timeNote.')'),
            'venueLines' => array_values(array_filter(
                array_map('trim', preg_split('/\R/', (string) $input['venue'])),
                fn ($line) => $line !== '',
            )),
            'host' => trim($input['host']),
            'noGifts' => (bool) ($input['no_gifts'] ?? false),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function drawCover(array $data, ?string $guest): void
    {
        $ink = self::COVER_INK;

        $title = mb_strtoupper($data['title']);
        $this->text($title, 53.0, 67.07, 'librebaskerville', 'B', $this->fit($title, 'librebaskerville', 'B', 25.43, 270, 14), $ink);
        $this->text($data['eventName'], 57.0, 94.24, 'librebaskerville', 'B', $this->fit($data['eventName'], 'librebaskerville', 'B', 18.37, 260, 11), $ink);

        // Name and lineage, each wrapped to the space left of the recipient box;
        // at most 3 lines, bottom-aligned to the original second line.
        // Khitan covers show the inviter (host) here instead of the child's name.
        $parts = $data['type'] === 'khitan'
            ? array_values(array_filter([$data['host']]))
            : array_values(array_filter([$data['subject'], $data['subjectLineage']]));
        $lines = [];
        $size = 18.0;
        for ($size = 18.0; $size > 11; $size -= 0.5) {
            if ($data['type'] === 'khitan') {
                // The inviter stays on one line: the font shrinks to fit instead of wrapping.
                $size = $this->fit($data['host'], 'freeserif', 'B', 18.0, 270, 6);
                $lines = [[[$data['host'], 'B']]];
                break;
            }
            $lines = array_merge(...array_map(fn ($part) => $this->wrap([[$part, 'B']], 270, 'freeserif', $size), $parts));
            if (count($lines) <= ($data['illustration'] ? 2 : 3)) {
                break;
            }
        }
        $leading = $size * 1.375;
        $last = count($parts) === 1 && count($lines) === 1 ? 208.5 : 220.89;
        foreach ($lines as $i => $runs) {
            $this->text($runs[0][0], 57.0, $last - (count($lines) - 1 - $i) * $leading, 'freeserif', 'B', $size, $ink);
        }

        if ($data['illustration']) {
            $this->drawIllustration($data['illustration']);
        }

        if ($data['noGifts']) {
            $noGifts = mb_strtoupper($data['noGiftsText']);
            $this->centered($noGifts, 437.7, 55.99, 'librebaskerville', 'B', $this->fit($noGifts, 'librebaskerville', 'B', 10.29, 200, 6), self::LETTER_INK);
        } else {
            $this->whiteOut(self::BADGE_RECT);
        }

        $this->text($data['recipientLabel'], 340.9, 125.54, 'freeserif', '', $this->fit($data['recipientLabel'], 'freeserif', '', 11, 200, 8), $ink);
        $salutationLine = $data['salutation'].' :';
        $this->text($salutationLine, 340.9, 140.55, 'freeserif', '', $this->fit($salutationLine, 'freeserif', '', 11, 240, 8), $ink);

        if ($guest !== null) {
            $this->drawGuestName($guest);
        }
    }

    /** Optional illustration, below the title on the left of the cover (fits the box, keeps aspect ratio). */
    private function drawIllustration(string $dataUrl): void
    {
        [$boxX, $boxY, $boxW, $boxH] = [57.0, 104.0, 270.0, 68.0];

        $bytes = base64_decode(substr($dataUrl, (int) strpos($dataUrl, ',') + 1), true);
        $size = $bytes === false ? false : @getimagesizefromstring($bytes);
        if ($size === false || $size[0] < 1 || $size[1] < 1) {
            return;
        }

        $scale = min($boxW / $size[0], $boxH / $size[1]);
        $w = $size[0] * $scale;
        $h = $size[1] * $scale;
        $this->mpdf->Image($dataUrl, $this->mm($boxX), $this->mm($boxY + ($boxH - $h) / 2), $this->mm($w), $this->mm($h), '', '', true, false);
    }

    private function drawGuestName(string $guest): void
    {
        $box = self::RECIPIENT_BOX;

        // Largest size (down to 9pt) at which the name wraps into at most 3 lines that fit the box.
        for ($size = 16.0; $size >= 9.0; $size -= 0.5) {
            $lines = $this->wrap([[$guest, 'B']], $box['w'], 'librebaskerville', $size);
            $leading = $size * 1.3;
            if (count($lines) <= 3 && count($lines) * $leading <= $box['h']) {
                break;
            }
        }

        $first = $box['cy'] - (count($lines) - 1) * $leading / 2 + $size * 0.35;
        foreach ($lines as $i => $runs) {
            $this->centeredRuns($runs, $box['cx'], $first + $i * $leading, 'librebaskerville', $size, self::COVER_INK);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function drawLetter(array $data): void
    {
        $ink = self::LETTER_INK;
        $font = 'librebaskerville';

        // Opening paragraph, re-wrapped like the original (3 lines with the sample data).
        $opening = [
            [str_replace('{sapaan}', $data['salutation'], $data['openingText']), ''],
            // A bare ":" label is glued to the event name instead of floating after a space.
            [$data['subjectLabel'] === ':' ? $data['eventName'].':' : $data['eventName'], 'B'],
            ...($data['subjectLabel'] === ':' ? [] : [[$data['subjectLabel'], '']]),
        ];
        for ($size = self::BODY_SIZE; $size > 10; $size -= 0.25) {
            $lines = $this->wrap($opening, self::LETTER_MAX_W, $font, $size);
            if (count($lines) <= 4) {
                break;
            }
        }
        foreach ($lines as $i => $runs) {
            $this->centeredRuns($runs, self::LETTER_CENTER, 401.30 + $i * self::BODY_LEADING, $font, $size, $ink);
        }

        // Deceased name in capitals: one line at 16.25pt, otherwise two lines.
        {
        $deceased = mb_strtoupper(trim($data['subject'].' '.($data['subjectLineage'] ?? '')));
        if ($this->width($deceased, $font, 'B', 16.25) <= self::LETTER_MAX_W) {
            $this->centered($deceased, self::LETTER_CENTER, 488.65, $font, 'B', 16.25, $ink);
        } else {
            for ($size = 16.25; $size > 10; $size -= 0.25) {
                $lines = $this->wrap([[$deceased, 'B']], self::LETTER_MAX_W, $font, $size);
                if (count($lines) <= 2) {
                    break;
                }
            }
            foreach ($lines as $i => $runs) {
                $this->centeredRuns($runs, self::LETTER_CENTER, 479.4 + $i * ($size * 1.2), $font, $size, $ink);
            }
        }

        }

        $this->centered($data['scheduleIntro'], self::LETTER_CENTER, 534.44, $font, '', $this->fit($data['scheduleIntro'], $font, '', self::BODY_SIZE, self::LETTER_MAX_W, 9), $ink);

        // Schedule rows line up with the colons baked into the template.
        $rows = [['Hari', $data['day'], 559.92], ['Tanggal', $data['date'], 580.18], ['Pukul', $data['time'], 600.44]];
        foreach ($rows as [$label, $value, $baseline]) {
            $this->text($label, 130.8, $baseline, $font, '', self::BODY_SIZE, $ink);
            $this->text($value, 273.0, $baseline, $font, '', $this->fit($value, $font, '', self::BODY_SIZE, 290, 9), $ink);
        }
        // Venue: each entered line wrapped to the card edge. Two lines at the
        // original spacing when possible; otherwise up to three tighter lines,
        // which still clear the closing paragraph. Nothing is dropped.
        $this->text('Tempat', 130.8, 620.69, $font, '', self::BODY_SIZE, $ink);
        $venueLines = fn (float $size) => array_merge(...array_map(
            fn ($line) => $this->wrap([[$line, '']], 282, $font, $size),
            $data['venueLines'],
        ));
        $leading = 20.26;
        for ($size = self::BODY_SIZE; $size >= 11; $size -= 0.25) {
            if (count($venue = $venueLines($size)) <= 2) {
                break;
            }
        }
        if (count($venue) > 2) {
            for ($size = 11.0; $size > 7; $size -= 0.25) {
                if (count($venue = $venueLines($size)) <= 3) {
                    break;
                }
            }
            $leading = min(15.8, $size * 1.35);
        }
        foreach ($venue as $i => $runs) {
            $this->text($runs[0][0], 273.0, 620.69 + $i * $leading, $font, '', $size, $ink);
        }

        $closing = str_replace('{sapaan}', $data['salutation'], $data['closingText']);
        for ($size = self::BODY_SIZE; $size > 9; $size -= 0.25) {
            $closingLines = $this->wrap([[$closing, '']], self::LETTER_MAX_W, $font, $size);
            if (count($closingLines) <= 3) {
                break;
            }
        }
        foreach ($closingLines as $i => $runs) {
            $this->centeredRuns($runs, self::LETTER_CENTER, 676.33 + $i * self::BODY_LEADING, $font, $size, $ink);
        }

        $this->centered($data['salamText'], self::LETTER_CENTER, 744.69, $font, 'B', self::BODY_SIZE, $ink);
        $this->centered($data['signoffText'], self::LETTER_CENTER, 783.98, $font, 'B', self::BODY_SIZE, $ink);

        $this->whiteOut(self::UNDERLINE_RECT);
        $hostSize = $this->fit($data['host'], $font, 'B', self::BODY_SIZE, 440, 9);
        $hostWidth = $this->width($data['host'], $font, 'B', $hostSize);
        $this->centered($data['host'], self::LETTER_CENTER, 806.82, $font, 'B', $hostSize, $ink);
        $this->fillRect([self::LETTER_CENTER - $hostWidth / 2, 807.5, self::LETTER_CENTER + $hostWidth / 2, 808.5], $ink);
    }

    /**
     * Greedy word wrap over styled runs ([text, style] pairs, style '' or 'B').
     *
     * @param  array<int, array{0: string, 1: string}>  $runs
     * @return array<int, array<int, array{0: string, 1: string}>> lines of runs
     */
    private function wrap(array $runs, float $maxWidth, string $font, float $size): array
    {
        $words = [];
        foreach ($runs as [$text, $style]) {
            foreach (preg_split('/\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY) as $word) {
                $words[] = [$word, $style];
            }
        }

        $space = $this->width(' ', $font, '', $size);
        $lines = [];
        $line = [];
        $lineWidth = 0.0;

        foreach ($words as [$word, $style]) {
            $w = $this->width($word, $font, $style, $size);
            if ($line !== [] && $lineWidth + $space + $w > $maxWidth) {
                $lines[] = $line;
                $line = [];
                $lineWidth = 0.0;
            }
            $lineWidth += ($line === [] ? 0 : $space) + $w;
            $line[] = [$word, $style];
        }
        if ($line !== []) {
            $lines[] = $line;
        }

        // Merge consecutive words of the same style back into runs.
        return array_map(function (array $words) {
            $merged = [];
            foreach ($words as [$word, $style]) {
                $last = array_key_last($merged);
                if ($last !== null && $merged[$last][1] === $style) {
                    $merged[$last][0] .= ' '.$word;
                } else {
                    $merged[] = [$word, $style];
                }
            }

            return $merged;
        }, $lines);
    }

    /**
     * @param  array<int, array{0: string, 1: string}>  $runs
     * @param  array{0: int, 1: int, 2: int}  $ink
     */
    private function centeredRuns(array $runs, float $centerX, float $baseline, string $font, float $size, array $ink): void
    {
        $space = $this->width(' ', $font, '', $size);
        $total = array_sum(array_map(fn ($run) => $this->width($run[0], $font, $run[1], $size), $runs)) + $space * (count($runs) - 1);

        $x = $centerX - $total / 2;
        foreach ($runs as [$text, $style]) {
            $this->text($text, $x, $baseline, $font, $style, $size, $ink);
            $x += $this->width($text, $font, $style, $size) + $space;
        }
    }

    /**
     * @param  array{0: int, 1: int, 2: int}  $ink
     */
    private function centered(string $text, float $centerX, float $baseline, string $font, string $style, float $size, array $ink): void
    {
        $this->text($text, $centerX - $this->width($text, $font, $style, $size) / 2, $baseline, $font, $style, $size, $ink);
    }

    /**
     * @param  array{0: int, 1: int, 2: int}  $ink
     */
    private function text(string $text, float $x, float $baseline, string $font, string $style, float $size, array $ink): void
    {
        $this->mpdf->SetFont($font, $style, $size);
        $this->mpdf->SetTextColor(...$ink);
        $this->mpdf->Text($this->mm($x), $this->mm($baseline), $text);
    }

    /** Text width in points. */
    private function width(string $text, string $font, string $style, float $size): float
    {
        $this->mpdf->SetFont($font, $style, $size);

        return $this->mpdf->GetStringWidth($text) * 72 / 25.4;
    }

    /** Largest size (down to $min) at which $text fits in $maxWidth points. */
    private function fit(string $text, string $font, string $style, float $size, float $maxWidth, float $min): float
    {
        while ($size > $min && $this->width($text, $font, $style, $size) > $maxWidth) {
            $size -= 0.25;
        }

        return $size;
    }

    /**
     * @param  array{0: float, 1: float, 2: float, 3: float}  $rect  x1, y1, x2, y2 in points
     */
    private function whiteOut(array $rect): void
    {
        $this->fillRect($rect, [255, 255, 255]);
    }

    /**
     * @param  array{0: float, 1: float, 2: float, 3: float}  $rect  x1, y1, x2, y2 in points
     * @param  array{0: int, 1: int, 2: int}  $color
     */
    private function fillRect(array $rect, array $color): void
    {
        [$x1, $y1, $x2, $y2] = $rect;
        $this->mpdf->SetFillColor(...$color);
        $this->mpdf->Rect($this->mm($x1), $this->mm($y1), $this->mm($x2 - $x1), $this->mm($y2 - $y1), 'F');
    }

    private function mm(float $points): float
    {
        return $points * 25.4 / 72;
    }

    private function makeMpdf(): Mpdf
    {
        $fontDirs = (new ConfigVariables)->getDefaults()['fontDir'];
        $fontData = (new FontVariables)->getDefaults()['fontdata'];

        $tempDir = storage_path('framework/cache/mpdf');
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0775, true);
        }

        return new Mpdf([
            'mode' => 'utf-8',
            'format' => [$this->mm(self::PAGE_W), $this->mm(self::PAGE_H)],
            'margin_left' => 0,
            'margin_right' => 0,
            'margin_top' => 0,
            'margin_bottom' => 0,
            'margin_header' => 0,
            'margin_footer' => 0,
            'autoPageBreak' => false,
            'tempDir' => $tempDir,
            'fontDir' => [...$fontDirs, resource_path('fonts')],
            'fontdata' => $fontData + [
                'librebaskerville' => [
                    'R' => 'LibreBaskerville-Regular.ttf',
                    'B' => 'LibreBaskerville-Bold.ttf',
                ],
            ],
            'default_font' => 'librebaskerville',
        ]);
    }
}
