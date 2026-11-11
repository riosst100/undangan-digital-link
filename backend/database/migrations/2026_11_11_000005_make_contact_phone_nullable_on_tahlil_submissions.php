<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Invitations drafted by an admin have no sender WhatsApp number.
    public function up(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->string('contact_phone', 20)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->string('contact_phone', 20)->nullable(false)->change();
        });
    }
};
