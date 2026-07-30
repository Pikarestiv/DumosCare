<?php

namespace App\Services;

use App\Models\CheckIn;
use App\Models\MonitoringProgram;

class CheckInProcessor
{
    public const BP_SYSTOLIC_HIGH = 140;

    public const BP_SYSTOLIC_LOW = 90;

    public const BP_DIASTOLIC_HIGH = 90;

    public const BP_DIASTOLIC_LOW = 60;

    /**
     * Parse free-text (from WhatsApp or a fallback web note) into structured
     * data appropriate for the program type. Simple regex matching, not NLP.
     */
    public function parseText(MonitoringProgram $program, string $text): array
    {
        $trimmed = trim($text);

        return match ($program->type) {
            'blood_pressure' => $this->parseBloodPressure($trimmed) ?? ['note' => $trimmed],
            'medication_adherence' => $this->parseMedicationConfirmation($trimmed) ?? ['note' => $trimmed],
            default => ['note' => $trimmed],
        };
    }

    private function parseBloodPressure(string $text): ?array
    {
        if (preg_match('/(\d{2,3})\s*\/\s*(\d{2,3})/', $text, $matches)) {
            return [
                'systolic' => (int) $matches[1],
                'diastolic' => (int) $matches[2],
            ];
        }

        return null;
    }

    private function parseMedicationConfirmation(string $text): ?array
    {
        $normalized = strtolower(trim($text));

        if (preg_match('/^(yes|taken|done|took it|y)$/i', $normalized)) {
            return ['taken' => true];
        }

        if (preg_match('/^(no|not yet|n|missed)$/i', $normalized)) {
            return ['taken' => false];
        }

        return null;
    }

    /**
     * Determine flagged status + reason for a given structured payload.
     */
    public function evaluateFlag(MonitoringProgram $program, array $structuredData): array
    {
        if ($program->type === 'blood_pressure' && isset($structuredData['systolic'], $structuredData['diastolic'])) {
            $systolic = $structuredData['systolic'];
            $diastolic = $structuredData['diastolic'];

            $config = $program->config ?? [];
            $sysHigh = $config['target_systolic_high'] ?? self::BP_SYSTOLIC_HIGH;
            $sysLow = $config['target_systolic_low'] ?? self::BP_SYSTOLIC_LOW;
            $diaHigh = $config['target_diastolic_high'] ?? self::BP_DIASTOLIC_HIGH;
            $diaLow = $config['target_diastolic_low'] ?? self::BP_DIASTOLIC_LOW;

            if ($systolic > $sysHigh || $systolic < $sysLow) {
                return [true, "Systolic {$systolic} outside range {$sysLow}-{$sysHigh}"];
            }

            if ($diastolic > $diaHigh || $diastolic < $diaLow) {
                return [true, "Diastolic {$diastolic} outside range {$diaLow}-{$diaHigh}"];
            }
        }

        if ($program->type === 'medication_adherence' && isset($structuredData['taken']) && $structuredData['taken'] === false) {
            return [true, 'Medication not taken'];
        }

        return [false, null];
    }

    /**
     * Create a CheckIn record with flagging applied.
     */
    public function createCheckIn(
        MonitoringProgram $program,
        string $source,
        array $structuredData,
        ?string $rawInput = null,
        ?string $imagePath = null,
    ): CheckIn {
        [$flagged, $flagReason] = $this->evaluateFlag($program, $structuredData);

        return $program->checkIns()->create([
            'source' => $source,
            'raw_input' => $rawInput,
            'structured_data' => $structuredData,
            'image_path' => $imagePath,
            'flagged' => $flagged,
            'flag_reason' => $flagReason,
        ]);
    }
}
