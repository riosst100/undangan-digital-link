<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('template_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('template_id');
            $table->unsignedInteger('version');
            $table->jsonb('schema'); // sections config, see docs/template-system.md
            $table->string('status')->default('draft'); // draft | published | archived
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->foreign('template_id')->references('id')->on('templates')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->unique(['template_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('template_versions');
    }
};
