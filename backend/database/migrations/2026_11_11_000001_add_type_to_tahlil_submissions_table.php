<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->string('type', 20)->default('tahlil')->after('contact_phone');
            $table->char('deceased_gender', 1)->nullable()->change();
            $table->string('deceased_name', 60)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
