<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->string('opening_text', 300)->nullable();
            $table->string('subject_label', 40)->nullable();
            $table->string('closing_text', 300)->nullable();
            $table->string('salam_text', 60)->nullable();
            $table->string('signoff_text', 60)->nullable();
            $table->string('recipient_label', 30)->nullable();
            $table->string('schedule_intro', 60)->nullable();
            $table->string('no_gifts_text', 40)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->dropColumn(['opening_text', 'subject_label', 'closing_text', 'salam_text', 'signoff_text', 'recipient_label', 'schedule_intro', 'no_gifts_text']);
        });
    }
};
