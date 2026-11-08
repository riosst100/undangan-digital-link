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
            'contact_phone' => $this->contactPhoneRules(),
            'status' => ['required', Rule::in(TahlilSubmission::STATUSES)],
        ];
    }
}
