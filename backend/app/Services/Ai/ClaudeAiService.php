<?php

namespace App\Services\Ai;

use App\Services\Ai\Exceptions\AiProviderException;
use Illuminate\Support\Facades\Http;
use Throwable;

class ClaudeAiService implements AiServiceInterface
{
    public function complete(string $systemPrompt, string $userPrompt, int $maxOutputTokens): string
    {
        $config = config('ai.claude');

        if (empty($config['api_key'])) {
            throw new AiProviderException('Claude API key is not configured.');
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $config['api_key'],
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
                ->timeout($config['timeout'])
                ->retry($config['max_retries'], 500)
                ->baseUrl($config['base_url'])
                ->post('/v1/messages', [
                    'model' => $config['model'],
                    'max_tokens' => $maxOutputTokens,
                    'system' => $systemPrompt,
                    'messages' => [
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                ]);
        } catch (Throwable $e) {
            throw new AiProviderException('Unable to reach the AI provider.', previous: $e);
        }

        if ($response->failed()) {
            throw new AiProviderException('AI provider returned an error: '.$response->status());
        }

        $text = $response->json('content.0.text');

        if (! is_string($text) || $text === '') {
            throw new AiProviderException('AI provider returned an empty response.');
        }

        return $text;
    }
}
