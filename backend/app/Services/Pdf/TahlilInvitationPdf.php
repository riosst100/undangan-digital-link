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
        $this->mpdf->SetTitle('Undangan '.$data['eventName'].' '.$data['deceasedTitle'].' '.$data['deceasedName']);
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
        $female = $input['deceased_gender'] === 'P';
        $date = Carbon::createFromFormat('Y-m-d', $input['date'])->locale('id');
        $parentName = trim((string) ($input['parent_name'] ?? ''));
        $timeNote = trim((string) ($input['time_note'] ?? ''));

        return [
            'eventName' => trim($input['event_name']),
            'deceasedTitle' => $female ? 'Almh.' : 'Alm.',
            'deceasedName' => trim($input['deceased_name']),
            'lineage' => $parentName === '' ? null : ($female ? 'Binti ' : 'Bin ').$parentName,
            'salutation' => trim($input['guest_salutation']),
            'day' => $date->translatedFormat('l'),
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

        $this->text('UNDANGAN', 53.0, 67.07, 'librebaskerville', 'B', 25.43, $ink);
        $this->text($data['eventName'], 57.0, 94.24, 'librebaskerville', 'B', $this->fit($data['eventName'], 'librebaskerville', 'B', 18.37, 260, 11), $ink);

        // Name and lineage, each wrapped to the space left of the recipient box;
        // at most 3 lines, bottom-aligned to the original second line.
        $parts = array_values(array_filter([$data['deceasedTitle'].' '.$data['deceasedName'], $data['lineage']]));
        for ($size = 18.0; $size > 11; $size -= 0.5) {
            $lines = array_merge(...array_map(fn ($part) => $this->wrap([[$part, 'B']], 270, 'freeserif', $size), $parts));
            if (count($lines) <= 3) {
                break;
            }
        }
        $leading = $size * 1.375;
        $last = count($parts) === 1 && count($lines) === 1 ? 208.5 : 220.89;
        foreach ($lines as $i => $runs) {
            $this->text($runs[0][0], 57.0, $last - (count($lines) - 1 - $i) * $leading, 'freeserif', 'B', $size, $ink);
        }

        if ($data['noGifts']) {
            $this->centered('TIDAK MENERIMA KONDANGAN', 437.7, 55.99, 'librebaskerville', 'B', 10.29, self::LETTER_INK);
        } else {
            $this->whiteOut(self::BADGE_RECT);
        }

        $this->text('Kepada Yth,', 340.9, 125.54, 'freeserif', '', 11, $ink);
        $salutationLine = $data['salutation'].' :';
        $this->text($salutationLine, 340.9, 140.55, 'freeserif', '', $this->fit($salutationLine, 'freeserif', '', 11, 240, 8), $ink);

        if ($guest !== null) {
            $this->drawGuestName($guest);
        }
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
            ['Dengan memohon Rahmat dan Ridho Allah SWT, kami memohon dengan hormat kehadiran '.$data['salutation'].' untuk memberikan do’a barokah pada acara', ''],
            [$data['eventName'], 'B'],
            ['wafatnya:', ''],
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
        $deceased = mb_strtoupper(trim($data['deceasedTitle'].' '.$data['deceasedName'].' '.($data['lineage'] ?? '')));
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

        $this->centered('Yang akan dilaksanakan pada :', self::LETTER_CENTER, 534.44, $font, '', self::BODY_SIZE, $ink);

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

        $this->centered('Demikian undangan ini kami sampaikan, atas perhatian dan', self::LETTER_CENTER, 676.33, $font, '', self::BODY_SIZE, $ink);
        $closing = 'keikhlasan langkah '.$data['salutation'].' untuk menghadiri undangan ini,';
        $this->centered($closing, self::LETTER_CENTER, 695.09, $font, '', $this->fit($closing, $font, '', self::BODY_SIZE, self::LETTER_MAX_W, 9), $ink);
        $this->centered('kami ucapkan terima kasih.', self::LETTER_CENTER, 713.84, $font, '', self::BODY_SIZE, $ink);

        $this->centered('Wassalamu’alaikum Wr.Wb', self::LETTER_CENTER, 744.69, $font, 'B', self::BODY_SIZE, $ink);
        $this->centered('Hormat Kami,', self::LETTER_CENTER, 783.98, $font, 'B', self::BODY_SIZE, $ink);

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
