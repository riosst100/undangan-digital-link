<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('slug')->unique();
            $table->uuid('template_id');
            $table->uuid('template_version_id');
            $table->uuid('theme_id');
            $table->uuid('theme_version_id');
            $table->string('status')->default('draft'); // draft | published | unpublished
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('template_id')->references('id')->on('templates')->restrictOnDelete();
            $table->foreign('template_version_id')->references('id')->on('template_versions')->restrictOnDelete();
            $table->foreign('theme_id')->references('id')->on('themes')->restrictOnDelete();
            $table->foreign('theme_version_id')->references('id')->on('theme_versions')->restrictOnDelete();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
