<?php

namespace App\Services\Ai;

interface AiServiceInterface
{
    /**
     * Send a prompt to the provider and return its raw text output.
     * Callers are responsible for schema validation / allowlist checks
     * on the returned data — this method only handles the provider call,
     * timeout, and retry.
     *
     * @throws \App\Services\Ai\Exceptions\AiProviderException
     */
    public function complete(string $systemPrompt, string $userPrompt, int $maxOutputTokens): string;
}
