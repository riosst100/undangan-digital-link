<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->string('title', 30)->default('UNDANGAN')->after('contact_phone');
        });
    }

    public function down(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
};
