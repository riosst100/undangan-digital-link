<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Concerns\RespondsWithTahlilPdf;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateTahlilSubmissionRequest;
use App\Http\Resources\Admin\TahlilSubmissionResource;
use App\Models\TahlilSubmission;
use App\Services\Pdf\TahlilInvitationPdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class TahlilSubmissionController extends Controller
{
    use ApiResponses, RespondsWithTahlilPdf;

    public function index(Request $request): JsonResponse
    {
        $request->validate(['status' => ['nullable', Rule::in(TahlilSubmission::STATUSES)]]);

        $submissions = TahlilSubmission::query()
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->get();

        return $this->success(TahlilSubmissionResource::collection($submissions));
    }

    public function show(TahlilSubmission $submission): JsonResponse
    {
        return $this->success(new TahlilSubmissionResource($submission));
    }

    public function update(UpdateTahlilSubmissionRequest $request, TahlilSubmission $submission): JsonResponse
    {
        $submission->update($request->validated());

        return $this->success(new TahlilSubmissionResource($submission));
    }

    public function destroy(TahlilSubmission $submission): JsonResponse
    {
        $submission->delete();

        return $this->success(null);
    }

    /** PDF from the saved data (unsaved edits are previewed via POST /admin/tahlil-invitations/pdf). */
    public function pdf(TahlilSubmission $submission, TahlilInvitationPdf $pdf): Response
    {
        return $this->tahlilPdfResponse($submission->toPdfInput(), $pdf);
    }
}
