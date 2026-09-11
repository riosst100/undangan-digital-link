<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('invitation_id');
            $table->string('name');
            $table->string('token')->unique();
            $table->unsignedSmallInteger('guest_count_hint')->default(1);
            $table->timestamp('opened_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('invitation_id')->references('id')->on('invitations')->cascadeOnDelete();
            $table->index('invitation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
