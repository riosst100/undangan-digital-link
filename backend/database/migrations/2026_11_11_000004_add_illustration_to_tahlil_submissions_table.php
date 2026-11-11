<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            // Optional cover illustration as a data URL (png/jpeg), downscaled by the browser.
            $table->longText('illustration')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->dropColumn('illustration');
        });
    }
};
