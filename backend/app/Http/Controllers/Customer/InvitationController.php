<?php

namespace App\Http\Controllers\Customer;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreInvitationRequest;
use App\Http\Resources\InvitationResource;
use App\Models\Invitation;
use App\Models\TemplateVersion;
use App\Models\ThemeVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class InvitationController extends Controller
{
    use ApiResponses;

    public function index(Request $request): JsonResponse
    {
        $invitations = $request->user()->invitations()->latest()->get();

        return $this->success(InvitationResource::collection($invitations));
    }

    public function store(StoreInvitationRequest $request): JsonResponse
    {
        $templateVersion = TemplateVersion::findOrFail($request->string('template_version_id'));
        $themeVersion = ThemeVersion::findOrFail($request->string('theme_version_id'));

        $invitation = $request->user()->invitations()->create([
            'slug' => $request->string('slug'),
            'template_id' => $templateVersion->template_id,
            'template_version_id' => $templateVersion->id,
            'theme_id' => $themeVersion->theme_id,
            'theme_version_id' => $themeVersion->id,
            'status' => 'draft',
        ]);

        return $this->success(new InvitationResource($invitation), 201);
    }

    public function show(Invitation $invitation): JsonResponse
    {
        Gate::authorize('view', $invitation);

        $invitation->load(['couple', 'events', 'story.items', 'gallery.items', 'giftAccounts', 'music']);

        return $this->success(new InvitationResource($invitation));
    }

    public function update(Request $request, Invitation $invitation): JsonResponse
    {
        Gate::authorize('update', $invitation);

        $validated = $request->validate([
            'slug' => ['sometimes', 'string', 'alpha_dash', 'max:100', 'unique:invitations,slug,'.$invitation->id],
        ]);

        $invitation->update($validated);

        return $this->success(new InvitationResource($invitation));
    }

    public function destroy(Invitation $invitation): JsonResponse
    {
        Gate::authorize('delete', $invitation);

        $invitation->delete();

        return $this->success(null, 204);
    }

    public function publish(Invitation $invitation): JsonResponse
    {
        Gate::authorize('update', $invitation);

        $invitation->update(['status' => 'published', 'published_at' => now()]);

        return $this->success(new InvitationResource($invitation));
    }

    public function unpublish(Invitation $invitation): JsonResponse
    {
        Gate::authorize('update', $invitation);

        $invitation->update(['status' => 'unpublished']);

        return $this->success(new InvitationResource($invitation));
    }
}
