<?php

namespace App\Http\Controllers\Customer;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Resources\GuestResource;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class GuestController extends Controller
{
    use ApiResponses;

    public function index(Invitation $invitation): JsonResponse
    {
        Gate::authorize('view', $invitation);

        $guests = $invitation->guests()->oldest()->get();

        return $this->success(GuestResource::collection($guests));
    }

    public function store(Request $request, Invitation $invitation): JsonResponse
    {
        Gate::authorize('update', $invitation);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $guest = $invitation->guests()->create($validated);

        return $this->success(new GuestResource($guest), 201);
    }

    public function update(Request $request, Invitation $invitation, Guest $guest): JsonResponse
    {
        Gate::authorize('update', $invitation);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $guest->update($validated);

        return $this->success(new GuestResource($guest));
    }

    public function destroy(Invitation $invitation, Guest $guest): JsonResponse
    {
        Gate::authorize('update', $invitation);

        $guest->delete();

        return $this->success(null, 204);
    }
}
