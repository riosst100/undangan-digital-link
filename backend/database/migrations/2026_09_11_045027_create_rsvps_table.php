<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rsvps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('invitation_id');
            $table->uuid('guest_id')->nullable();
            $table->string('attendance'); // attending | not_attending | maybe
            $table->unsignedSmallInteger('guest_count')->default(1);
            $table->text('message')->nullable();
            $table->timestamps();

            $table->foreign('invitation_id')->references('id')->on('invitations')->cascadeOnDelete();
            $table->foreign('guest_id')->references('id')->on('guests')->nullOnDelete();
            $table->index('invitation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rsvps');
    }
};
