<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gift_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('invitation_id');
            $table->string('bank_name');
            $table->string('account_number');
            $table->string('account_holder');
            $table->uuid('qris_media_id')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('invitation_id')->references('id')->on('invitations')->cascadeOnDelete();
            $table->foreign('qris_media_id')->references('id')->on('media')->nullOnDelete();
            $table->index('invitation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gift_accounts');
    }
};
