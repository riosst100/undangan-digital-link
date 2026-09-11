<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->unsignedBigInteger('price')->default(0)->after('description'); // smallest currency unit (IDR)
            $table->string('tier')->default('standard')->after('price'); // standard | exclusive
            $table->string('thumbnail_url')->nullable()->after('tier');
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn(['price', 'tier', 'thumbnail_url']);
        });
    }
};
