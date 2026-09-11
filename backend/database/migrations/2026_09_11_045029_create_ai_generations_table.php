<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_generations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('feature'); // story_generate, story_improve, quote, ...
            $table->string('provider');
            $table->string('model');
            $table->text('prompt');
            $table->jsonb('input');
            $table->jsonb('output')->nullable();
            $table->string('status'); // success | failed | rejected_validation
            $table->text('error_message')->nullable();
            $table->string('source_type')->nullable(); // e.g. "invitation", "template"
            $table->uuid('source_id')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_generations');
    }
};
