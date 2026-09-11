<?php

namespace App\Services\Ai;

readonly class AiGenerationResult
{
    public function __construct(
        public bool $success,
        public ?array $data = null,
        public ?string $errorMessage = null,
        public ?string $rawOutput = null,
    ) {
    }

    public static function ok(array $data, ?string $rawOutput = null): self
    {
        return new self(success: true, data: $data, rawOutput: $rawOutput);
    }

    public static function fail(string $message, ?string $rawOutput = null): self
    {
        return new self(success: false, errorMessage: $message, rawOutput: $rawOutput);
    }
}
