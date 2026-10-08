<?php

use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\TemplateController as AdminTemplateController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Customer\GuestController as CustomerGuestController;
use App\Http\Controllers\Customer\InvitationController as CustomerInvitationController;
use App\Http\Controllers\Public\InvitationController as PublicInvitationController;
use App\Http\Controllers\Public\TemplateCatalogController;
use App\Http\Controllers\Public\TemplatePreviewController;
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

        Route::scopeBindings()->group(function () {
            Route::get('invitations/{invitation}/guests', [CustomerGuestController::class, 'index']);
            Route::post('invitations/{invitation}/guests', [CustomerGuestController::class, 'store']);
            Route::patch('invitations/{invitation}/guests/{guest}', [CustomerGuestController::class, 'update']);
            Route::delete('invitations/{invitation}/guests/{guest}', [CustomerGuestController::class, 'destroy']);
        });

        // Couple/events/story/gallery/gift/music sub-resources and rsvps
        // listing are implemented incrementally in Phase 4.
    });

    Route::middleware('can:admin')->prefix('admin')->group(function () {
        Route::get('templates', [AdminTemplateController::class, 'index']);
        Route::post('templates', [AdminTemplateController::class, 'store']);
        Route::delete('templates/{template}', [AdminTemplateController::class, 'destroy']);

        Route::get('customers', [AdminCustomerController::class, 'index']);

        // Invitations oversight, theme management. See docs/api.md — implemented incrementally in Phase 6.
    });
});

Route::prefix('public')->group(function () {
    Route::get('templates/catalog', [TemplateCatalogController::class, 'index']);
    Route::get('templates/{slug}', [TemplatePreviewController::class, 'show']);
    Route::get('invitations/{slug}', [PublicInvitationController::class, 'show']);
    Route::post('invitations/{slug}/rsvp', [PublicInvitationController::class, 'rsvp']);
    Route::post('invitations/{slug}/track-view', [PublicInvitationController::class, 'trackView']);
});
