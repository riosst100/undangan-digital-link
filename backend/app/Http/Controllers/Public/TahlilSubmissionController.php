<?php

namespace App\Http\Controllers\Public;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\SubmitTahlilInvitationRequest;
use App\Models\TahlilSubmission;
use Illuminate\Http\JsonResponse;

class TahlilSubmissionController extends Controller
{
    use ApiResponses;

    public function store(SubmitTahlilInvitationRequest $request): JsonResponse
    {
        $submission = TahlilSubmission::create([...$request->validated(), 'status' => 'baru']);

        return $this->success(['id' => $submission->id], 201);
    }
}
