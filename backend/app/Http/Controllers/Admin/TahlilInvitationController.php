<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\RespondsWithTahlilPdf;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GenerateTahlilInvitationRequest;
use App\Services\Pdf\TahlilInvitationPdf;
use Illuminate\Http\Response;

class TahlilInvitationController extends Controller
{
    use RespondsWithTahlilPdf;

    public function pdf(GenerateTahlilInvitationRequest $request, TahlilInvitationPdf $pdf): Response
    {
        return $this->tahlilPdfResponse($request->validated(), $pdf);
    }
}
