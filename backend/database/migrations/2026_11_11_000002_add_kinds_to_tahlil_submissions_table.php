<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->string('khitan_kind', 20)->nullable()->after('type');
            $table->string('groom_name', 40)->nullable()->after('parent_name');
            $table->string('bride_name', 40)->nullable()->after('groom_name');
            $table->string('child_name', 60)->nullable()->after('bride_name');
        });

        // Sinoman and sedekah are now kinds of khitan.
        foreach (['sinoman', 'sedekah'] as $kind) {
            DB::table('tahlil_submissions')->where('type', $kind)->update(['type' => 'khitan', 'khitan_kind' => $kind]);
        }
    }

    public function down(): void
    {
        Schema::table('tahlil_submissions', function (Blueprint $table) {
            $table->dropColumn(['khitan_kind', 'groom_name', 'bride_name', 'child_name']);
        });
    }
};
