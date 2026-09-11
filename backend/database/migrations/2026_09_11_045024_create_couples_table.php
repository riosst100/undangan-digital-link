<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('couples', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('invitation_id')->unique();

            $table->string('bride_name');
            $table->string('bride_nickname')->nullable();
            $table->string('bride_parents')->nullable();
            $table->uuid('bride_photo_media_id')->nullable();
            $table->text('bride_bio')->nullable();

            $table->string('groom_name');
            $table->string('groom_nickname')->nullable();
            $table->string('groom_parents')->nullable();
            $table->uuid('groom_photo_media_id')->nullable();
            $table->text('groom_bio')->nullable();

            $table->timestamps();

            $table->foreign('invitation_id')->references('id')->on('invitations')->cascadeOnDelete();
            $table->foreign('bride_photo_media_id')->references('id')->on('media')->nullOnDelete();
            $table->foreign('groom_photo_media_id')->references('id')->on('media')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('couples');
    }
};
