<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            // Buku tamu: the greeting template picked by the customer
            // (e.g. pernikahan_muslim) and the WhatsApp message text built
            // from it, which the customer may further edit.
            $table->string('share_template')->nullable()->after('status');
            $table->text('share_message')->nullable()->after('share_template');
        });
    }

    public function down(): void
    {
        Schema::table('invitations', function (Blueprint $table) {
            $table->dropColumn(['share_template', 'share_message']);
        });
    }
};
