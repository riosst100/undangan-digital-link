<?php

use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\TahlilInvitationController;
use App\Http\Controllers\Admin\TahlilSubmissionController as AdminTahlilSubmissionController;
use App\Http\Controllers\Admin\TahlilSubmissionCsvController;
use App\Http\Controllers\Admin\TemplateController as AdminTemplateController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Customer\GuestController as CustomerGuestController;
use App\Http\Controllers\Customer\InvitationController as CustomerInvitationController;
use App\Http\Controllers\Public\InvitationController as PublicInvitationController;
use App\Http\Controllers\Public\TahlilSubmissionController as PublicTahlilSubmissionController;
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
        Route::get('templates/{template}', [AdminTemplateController::class, 'show']);
        Route::patch('templates/{template}', [AdminTemplateController::class, 'update']);
        Route::put('templates/{template}/design', [AdminTemplateController::class, 'saveDesign']);
        Route::post('templates/{template}/images', [AdminTemplateController::class, 'addImages']);
        Route::delete('templates/{template}/images', [AdminTemplateController::class, 'removeImage']);
        Route::delete('templates/{template}', [AdminTemplateController::class, 'destroy']);

        Route::get('customers', [AdminCustomerController::class, 'index']);

        Route::post('tahlil-invitations/pdf', [TahlilInvitationController::class, 'pdf']);
        Route::get('tahlil-submissions/export', [TahlilSubmissionCsvController::class, 'export']);
        Route::post('tahlil-submissions/import', [TahlilSubmissionCsvController::class, 'import']);
        Route::get('tahlil-submissions', [AdminTahlilSubmissionController::class, 'index']);
        Route::post('tahlil-submissions', [AdminTahlilSubmissionController::class, 'store']);
        Route::get('tahlil-submissions/{submission}', [AdminTahlilSubmissionController::class, 'show'])->whereUuid('submission');
        Route::patch('tahlil-submissions/{submission}', [AdminTahlilSubmissionController::class, 'update'])->whereUuid('submission');
        Route::delete('tahlil-submissions/{submission}', [AdminTahlilSubmissionController::class, 'destroy'])->whereUuid('submission');
        Route::get('tahlil-submissions/{submission}/pdf', [AdminTahlilSubmissionController::class, 'pdf'])->whereUuid('submission');

        // Invitations oversight, theme management. See docs/api.md — implemented incrementally in Phase 6.
    });
});

Route::prefix('public')->group(function () {
    Route::get('templates/catalog', [TemplateCatalogController::class, 'index']);
    Route::get('templates/{slug}', [TemplatePreviewController::class, 'show']);
    Route::get('invitations/{slug}', [PublicInvitationController::class, 'show']);
    Route::post('invitations/{slug}/rsvp', [PublicInvitationController::class, 'rsvp']);
    Route::post('invitations/{slug}/track-view', [PublicInvitationController::class, 'trackView']);

    // Unauthenticated, stores a row per call: keep it tightly throttled per IP.
    Route::post('tahlil-submissions', [PublicTahlilSubmissionController::class, 'store'])->middleware('throttle:5,1');
});
