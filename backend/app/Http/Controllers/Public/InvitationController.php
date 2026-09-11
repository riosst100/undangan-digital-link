<?php

namespace App\Http\Controllers\Public;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\Rsvp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    use ApiResponses;

    public function show(Request $request, string $slug): JsonResponse
    {
        $invitation = Invitation::where('slug', $slug)
            ->where('status', 'published')
            ->with(['couple', 'events', 'story.items', 'gallery.items.media', 'templateVersion', 'themeVersion'])
            ->first();

        if (! $invitation) {
            return $this->fail('Undangan tidak ditemukan.', 404);
        }

        $guestName = null;

        if ($token = $request->query('to')) {
            $guest = Guest::where('invitation_id', $invitation->id)->where('token', $token)->first();

            if ($guest) {
                $guestName = $guest->name;
                $guest->update(['opened_at' => $guest->opened_at ?? now()]);
            }
        }

        $couple = $invitation->couple;

        return $this->success([
            'slug' => $invitation->slug,
            'status' => $invitation->status,
            'sections' => $invitation->templateVersion->schema['sections'] ?? [],
            'theme' => $invitation->themeVersion->tokens,
            'content' => [
                'cover' => [
                    'brideNickname' => $couple->bride_nickname ?? $couple->bride_name ?? '',
                    'groomNickname' => $couple->groom_nickname ?? $couple->groom_name ?? '',
                    'eventDate' => optional($invitation->events->first())->date?->toDateString() ?? '',
                    'guestName' => $guestName,
                ],
            ],
            'seo' => [
                'title' => trim(($couple->groom_nickname ?? '').' & '.($couple->bride_nickname ?? '')) ?: 'Undangan Pernikahan',
                'description' => 'Undangan pernikahan digital',
            ],
        ]);
    }

    public function rsvp(Request $request, string $slug): JsonResponse
    {
        $invitation = Invitation::where('slug', $slug)->where('status', 'published')->firstOrFail();

        $validated = $request->validate([
            'guest_token' => ['nullable', 'string'],
            'attendance' => ['required', 'in:attending,not_attending,maybe'],
            'guest_count' => ['required', 'integer', 'min:1', 'max:20'],
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        $guest = $validated['guest_token'] ?? null
            ? \App\Models\Guest::where('invitation_id', $invitation->id)->where('token', $validated['guest_token'])->first()
            : null;

        $rsvp = Rsvp::create([
            'invitation_id' => $invitation->id,
            'guest_id' => $guest?->id,
            'attendance' => $validated['attendance'],
            'guest_count' => $validated['guest_count'],
            'message' => $validated['message'] ?? null,
        ]);

        AnalyticsEvent::create([
            'invitation_id' => $invitation->id,
            'guest_id' => $guest?->id,
            'type' => 'rsvp_submit',
        ]);

        return $this->success(['id' => $rsvp->id], 201);
    }

    public function trackView(Request $request, string $slug): JsonResponse
    {
        $invitation = Invitation::where('slug', $slug)->where('status', 'published')->firstOrFail();

        AnalyticsEvent::create([
            'invitation_id' => $invitation->id,
            'type' => 'view',
            'device' => $request->header('Sec-Ch-Ua-Platform'),
            'browser' => $request->userAgent(),
            'referrer' => $request->header('referer'),
        ]);

        return $this->success(null, 204);
    }
}
