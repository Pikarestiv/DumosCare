<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonitoringProgram;
use App\Models\Patient;
use App\Services\CheckInProcessor;
use App\Services\WhatsAppCloudApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class WhatsAppWebhookController extends Controller
{
    public function __construct(
        private readonly CheckInProcessor $processor,
    ) {}

    /**
     * Meta's webhook verification handshake (GET request with hub.challenge).
     */
    public function verify(Request $request): Response
    {
        $mode = $request->query('hub_mode') ?? $request->query('hub.mode');
        $token = $request->query('hub_verify_token') ?? $request->query('hub.verify_token');
        $challenge = $request->query('hub_challenge') ?? $request->query('hub.challenge');

        if ($mode === 'subscribe' && $token === config('services.whatsapp.verify_token')) {
            return response($challenge, 200);
        }

        return response('Forbidden', 403);
    }

    /**
     * Receive inbound message/status webhook events from the WhatsApp Cloud API.
     */
    public function handle(Request $request): Response
    {
        $payload = $request->all();

        foreach (data_get($payload, 'entry', []) as $entry) {
            foreach (data_get($entry, 'changes', []) as $change) {
                $messages = data_get($change, 'value.messages', []);

                foreach ($messages as $message) {
                    $this->processMessage($message);
                }
            }
        }

        return response()->json(['status' => 'ok']);
    }

    private function processMessage(array $message): void
    {
        $fromPhone = $message['from'] ?? null;

        if (! $fromPhone) {
            return;
        }

        $patient = $this->findPatientByPhone($fromPhone);

        if (! $patient) {
            Log::info('WhatsApp message from unknown number', ['from' => $fromPhone]);

            return;
        }

        $type = $message['type'] ?? 'text';

        if ($type === 'image') {
            $this->handleImageMessage($patient, $message);
        } elseif ($type === 'text') {
            $this->handleTextMessage($patient, $message);
        }

        WhatsAppCloudApi::make()->sendText($patient->phone, 'Got it, thanks!');
    }

    private function handleTextMessage(Patient $patient, array $message): void
    {
        $text = $message['text']['body'] ?? '';

        if ($text === '') {
            return;
        }

        $bpProgram = null;
        $medProgram = null;

        if (preg_match('/(\d{2,3})\s*\/\s*(\d{2,3})/', $text)) {
            $bpProgram = $this->activeProgramOfType($patient, 'blood_pressure');
        }

        if (preg_match('/^\s*(yes|taken|done|took it|y|no|not yet|n|missed)\s*$/i', $text)) {
            $medProgram = $this->activeProgramOfType($patient, 'medication_adherence');
        }

        $program = $bpProgram ?? $medProgram ?? $this->activeProgramOfType($patient, 'general_checkin')
            ?? $patient->activePrograms()->first();

        if (! $program) {
            Log::info('No active program for patient, dropping WhatsApp text', ['patient_id' => $patient->id]);

            return;
        }

        $structuredData = $this->processor->parseText($program, $text);

        $this->processor->createCheckIn($program, 'whatsapp', $structuredData, rawInput: $text);
    }

    private function handleImageMessage(Patient $patient, array $message): void
    {
        $program = $this->activeProgramOfType($patient, 'wound_care') ?? $patient->activePrograms()->first();

        if (! $program) {
            Log::info('No active program for patient, dropping WhatsApp image', ['patient_id' => $patient->id]);

            return;
        }

        $mediaId = $message['image']['id'] ?? null;
        $imagePath = null;

        if ($mediaId) {
            $media = WhatsAppCloudApi::make()->downloadMedia($mediaId);

            if ($media) {
                $extension = str_contains($media['mime_type'] ?? '', 'png') ? 'png' : 'jpg';
                $imagePath = "wound-photos/{$patient->id}-".Str::random(12).".{$extension}";
                Storage::disk('public')->put($imagePath, $media['contents']);
            }
        }

        $caption = $message['image']['caption'] ?? null;

        $this->processor->createCheckIn(
            $program,
            'whatsapp',
            ['caption' => $caption],
            rawInput: $caption,
            imagePath: $imagePath,
        );
    }

    private function activeProgramOfType(Patient $patient, string $type): ?MonitoringProgram
    {
        return $patient->activePrograms()->where('type', $type)->first();
    }

    private function findPatientByPhone(string $phone): ?Patient
    {
        $normalized = $this->normalizePhone($phone);

        return Patient::all()->first(fn (Patient $p) => $this->normalizePhone($p->phone) === $normalized);
    }

    private function normalizePhone(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone);
    }
}
