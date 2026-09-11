<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theme_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('theme_id');
            $table->unsignedInteger('version');
            $table->jsonb('tokens'); // colors/typography/spacing/radius/shadows/animations
            $table->string('status')->default('draft'); // draft | published | archived
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->foreign('theme_id')->references('id')->on('themes')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->unique(['theme_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theme_versions');
    }
};
