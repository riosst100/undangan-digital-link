<?php

namespace App\Http\Requests\Public;

use App\Http\Requests\Admin\GenerateTahlilInvitationRequest;

/**
 * Public (unauthenticated) submission: the invitation fields plus a WhatsApp
 * number so the admin can send the finished PDF back. Smaller guest cap,
 * since each guest becomes a rendered page later.
 */
class SubmitTahlilInvitationRequest extends GenerateTahlilInvitationRequest
{
    public const MAX_GUESTS = 50;

    protected function prepareForValidation(): void
    {
        $this->normaliseContactPhone();
    }

    public function rules(): array
    {
        return [...parent::rules(), 'contact_phone' => $this->contactPhoneRules()];
    }
}
