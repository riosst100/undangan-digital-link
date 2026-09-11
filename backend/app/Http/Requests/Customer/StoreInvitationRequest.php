<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvitationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'slug' => ['required', 'string', 'alpha_dash', 'max:100', 'unique:invitations,slug'],
            'template_version_id' => [
                'required', 'uuid',
                Rule::exists('template_versions', 'id')->where('status', 'published'),
            ],
            'theme_version_id' => [
                'required', 'uuid',
                Rule::exists('theme_versions', 'id')->where('status', 'published'),
            ],
        ];
    }
}
