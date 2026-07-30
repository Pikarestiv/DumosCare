<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppCloudApi
{
    private string $baseUrl;

    public function __construct(
        private readonly ?string $token = null,
        private readonly ?string $phoneNumberId = null,
        private readonly string $apiVersion = 'v21.0',
    ) {
        $this->baseUrl = "https://graph.facebook.com/{$this->apiVersion}";
    }

    public static function make(): self
    {
        return new self(
            config('services.whatsapp.token'),
            config('services.whatsapp.phone_number_id'),
            config('services.whatsapp.api_version', 'v21.0'),
        );
    }

    /**
     * Send a plain text message to a WhatsApp number.
     */
    public function sendText(string $to, string $message): bool
    {
        if (! $this->token || ! $this->phoneNumberId) {
            Log::info('WhatsApp Cloud API not configured, skipping send', ['to' => $to, 'message' => $message]);

            return false;
        }

        $response = Http::withToken($this->token)
            ->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $to,
                'type' => 'text',
                'text' => ['body' => $message],
            ]);

        if ($response->failed()) {
            Log::warning('WhatsApp send failed', ['to' => $to, 'response' => $response->json()]);
        }

        return $response->successful();
    }

    /**
     * Fetch the download URL for a media object, then download its bytes.
     */
    public function downloadMedia(string $mediaId): ?array
    {
        if (! $this->token) {
            return null;
        }

        $meta = Http::withToken($this->token)->get("{$this->baseUrl}/{$mediaId}");

        if ($meta->failed() || ! $meta->json('url')) {
            Log::warning('WhatsApp media metadata fetch failed', ['media_id' => $mediaId]);

            return null;
        }

        $file = Http::withToken($this->token)->get($meta->json('url'));

        if ($file->failed()) {
            Log::warning('WhatsApp media download failed', ['media_id' => $mediaId]);

            return null;
        }

        return [
            'contents' => $file->body(),
            'mime_type' => $meta->json('mime_type', $file->header('Content-Type')),
        ];
    }
}
