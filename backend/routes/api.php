<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Customer\InvitationController as CustomerInvitationController;
use App\Http\Controllers\Public\InvitationController as PublicInvitationController;
use App\Http\Controllers\Public\TemplateCatalogController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::prefix('customer')->group(function () {
        Route::get('invitations', [CustomerInvitationController::class, 'index']);
        Route::post('invitations', [CustomerInvitationController::class, 'store']);
        Route::get('invitations/{invitation}', [CustomerInvitationController::class, 'show']);
        Route::patch('invitations/{invitation}', [CustomerInvitationController::class, 'update']);
        Route::delete('invitations/{invitation}', [CustomerInvitationController::class, 'destroy']);
        Route::post('invitations/{invitation}/publish', [CustomerInvitationController::class, 'publish']);
        Route::post('invitations/{invitation}/unpublish', [CustomerInvitationController::class, 'unpublish']);

        // Couple/events/story/gallery/gift/music sub-resources and guests/rsvps
        // listing are implemented incrementally in Phase 4.
    });

    Route::middleware('can:admin')->prefix('admin')->group(function () {
        // Customers, invitations oversight, template/theme management, AI generator.
        // See docs/api.md — implemented incrementally in Phase 6.
    });

    Route::prefix('ai')->middleware('throttle:ai')->group(function () {
        // Story/quote/opening/closing/couple-bio/event-description/whatsapp-message
        // generation endpoints. See docs/ai.md — implemented in Phase 5.
    });
});

Route::prefix('public')->group(function () {
    Route::get('templates/catalog', [TemplateCatalogController::class, 'index']);
    Route::get('invitations/{slug}', [PublicInvitationController::class, 'show']);
    Route::post('invitations/{slug}/rsvp', [PublicInvitationController::class, 'rsvp']);
    Route::post('invitations/{slug}/track-view', [PublicInvitationController::class, 'trackView']);
});
