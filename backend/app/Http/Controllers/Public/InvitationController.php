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
            ->with(['couple', 'events', 'story.items', 'gallery.items.media', 'giftAccounts.qrisMedia', 'templateVersion', 'themeVersion'])
            ->first();

        if (! $invitation) {
            return $this->fail('Undangan tidak ditemukan.', 404);
        }

        $guestName = null;
        $guestToken = null;

        if ($token = $request->query('to')) {
            $guest = Guest::where('invitation_id', $invitation->id)->where('token', $token)->first();

            if ($guest) {
                $guestName = $guest->name;
                $guestToken = $guest->token;
                $guest->update(['opened_at' => $guest->opened_at ?? now()]);
            }
        }

        $couple = $invitation->couple;
        $firstEvent = $invitation->events->first();
        $sections = $invitation->templateVersion->schema['sections'] ?? [];
        $quoteSection = collect($sections)->firstWhere('type', 'quote');

        return $this->success([
            'slug' => $invitation->slug,
            'status' => $invitation->status,
            'sections' => $sections,
            'theme' => $invitation->themeVersion->tokens,
            'content' => [
                'cover' => [
                    'brideNickname' => $couple->bride_nickname ?? $couple->bride_name ?? '',
                    'groomNickname' => $couple->groom_nickname ?? $couple->groom_name ?? '',
                    'eventDate' => $firstEvent?->date?->toDateString() ?? '',
                    'guestName' => $guestName,
                ],
                'couple' => [
                    'bride' => [
                        'name' => $couple->bride_name,
                        'nickname' => $couple->bride_nickname,
                        'parents' => $couple->bride_parents,
                        'bio' => $couple->bride_bio,
                        'photoUrl' => $couple->bridePhoto?->url(),
                    ],
                    'groom' => [
                        'name' => $couple->groom_name,
                        'nickname' => $couple->groom_nickname,
                        'parents' => $couple->groom_parents,
                        'bio' => $couple->groom_bio,
                        'photoUrl' => $couple->groomPhoto?->url(),
                    ],
                ],
                'event' => [
                    'events' => $invitation->events->map(fn ($event) => [
                        'type' => $event->type,
                        'title' => $event->title,
                        'date' => $event->date?->toDateString(),
                        'startTime' => $event->start_time,
                        'endTime' => $event->end_time,
                        'venueName' => $event->venue_name,
                        'address' => $event->address,
                        'mapsUrl' => $event->maps_url,
                        'description' => $event->description,
                    ])->values(),
                ],
                'story' => [
                    'title' => $invitation->story?->title,
                    'items' => $invitation->story?->items->map(fn ($item) => [
                        'year' => $item->year,
                        'title' => $item->title,
                        'description' => $item->description,
                    ])->values() ?? [],
                ],
                'gallery' => [
                    'items' => $invitation->gallery?->items->map(fn ($item) => [
                        'url' => $item->media?->url(),
                        'caption' => $item->caption,
                    ])->values() ?? [],
                ],
                'rsvp' => [
                    'invitationSlug' => $invitation->slug,
                    'guestToken' => $guestToken,
                ],
                'gift' => [
                    'accounts' => $invitation->giftAccounts->map(fn ($account) => [
                        'bankName' => $account->bank_name,
                        'accountNumber' => $account->account_number,
                        'accountHolder' => $account->account_holder,
                        'qrisUrl' => $account->qrisMedia?->url(),
                    ])->values(),
                ],
                'quote' => [
                    'text' => $quoteSection['settings']['text'] ?? null,
                ],
                'guest_greeting' => [
                    'guestName' => $guestName,
                ],
                'closing' => [
                    'brideNickname' => $couple->bride_nickname ?? $couple->bride_name ?? '',
                    'groomNickname' => $couple->groom_nickname ?? $couple->groom_name ?? '',
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
