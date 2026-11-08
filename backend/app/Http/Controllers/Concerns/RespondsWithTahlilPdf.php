<?php

namespace App\Http\Controllers\Concerns;

use App\Services\Pdf\TahlilInvitationPdf;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

trait RespondsWithTahlilPdf
{
    /**
     * @param  array<string, mixed>  $validated
     */
    protected function tahlilPdfResponse(array $validated, TahlilInvitationPdf $pdf): Response
    {
        $filename = 'undangan-'.Str::slug($validated['event_name'].' '.$validated['deceased_name']).'.pdf';

        return response($pdf->render($validated), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'Cache-Control' => 'no-store',
        ]);
    }
}
