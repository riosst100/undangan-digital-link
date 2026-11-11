<?php

namespace App\Http\Requests\Admin;

use App\Models\TahlilSubmission;
use Illuminate\Validation\Rule;

/** Admin-drafted invitation: same fields as an update, status defaults on the server. */
class StoreTahlilSubmissionRequest extends GenerateTahlilInvitationRequest
{
    protected function prepareForValidation(): void
    {
        $this->normaliseContactPhone();
    }

    public function rules(): array
    {
        return [
            ...parent::rules(),
            'contact_phone' => ['nullable', 'string', 'regex:/^08[0-9]{7,12}$/'],
            'status' => ['nullable', Rule::in(TahlilSubmission::STATUSES)],
        ];
    }
}
