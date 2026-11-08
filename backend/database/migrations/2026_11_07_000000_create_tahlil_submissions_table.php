<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tahlil_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('contact_phone', 20);
            $table->string('event_name', 40);
            $table->char('deceased_gender', 1);
            $table->string('deceased_name', 60);
            $table->string('parent_name', 60)->nullable();
            $table->string('guest_salutation', 30);
            $table->date('date');
            $table->string('time', 5);
            $table->string('timezone', 4);
            $table->string('time_note', 30)->nullable();
            $table->string('venue', 150);
            $table->string('host', 60);
            $table->boolean('no_gifts')->default(true);
            $table->json('guests')->nullable();
            $table->string('status', 20)->default('baru');
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tahlil_submissions');
    }
};
