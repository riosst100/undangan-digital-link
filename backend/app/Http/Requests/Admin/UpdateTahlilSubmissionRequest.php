<?php

namespace App\Http\Requests\Admin;

use App\Models\TahlilSubmission;
use Illuminate\Validation\Rule;

class UpdateTahlilSubmissionRequest extends GenerateTahlilInvitationRequest
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
            'status' => ['required', Rule::in(TahlilSubmission::STATUSES)],
        ];
    }
}
