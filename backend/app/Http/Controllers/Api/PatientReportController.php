<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Services\CheckInProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PatientReportController extends Controller
{
    public function __construct(
        private readonly CheckInProcessor $processor,
    ) {}

    public function show(string $token)
    {
        $patient = Patient::where('report_token', $token)->firstOrFail();

        return response()->json([
            'patient' => [
                'name' => $patient->name,
            ],
            'programs' => $patient->activePrograms()->get(['id', 'type', 'config']),
        ]);
    }

    public function store(Request $request, string $token)
    {
        $patient = Patient::where('report_token', $token)->firstOrFail();

        $validated = $request->validate([
            'program_id' => [
                'required',
                'integer',
                Rule::exists('monitoring_programs', 'id')->where('patient_id', $patient->id),
            ],
            'systolic' => 'nullable|integer|min:40|max:300',
            'diastolic' => 'nullable|integer|min:20|max:200',
            'taken' => 'nullable|boolean',
            'note' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|max:8192',
        ]);

        $program = $patient->programs()->findOrFail($validated['program_id']);

        $structuredData = match ($program->type) {
            'blood_pressure' => array_filter([
                'systolic' => $validated['systolic'] ?? null,
                'diastolic' => $validated['diastolic'] ?? null,
            ], fn ($v) => $v !== null),
            'medication_adherence' => array_filter([
                'taken' => $request->has('taken') ? $request->boolean('taken') : null,
                'note' => $validated['note'] ?? null,
            ], fn ($v) => $v !== null),
            'wound_care' => array_filter([
                'note' => $validated['note'] ?? null,
            ]),
            default => array_filter([
                'note' => $validated['note'] ?? null,
            ]),
        };

        $imagePath = null;

        if ($request->hasFile('photo')) {
            $imagePath = "wound-photos/{$patient->id}-".Str::random(12).'.'.$request->file('photo')->extension();
            Storage::disk('public')->putFileAs(
                'wound-photos',
                $request->file('photo'),
                basename($imagePath),
            );
        }

        $checkIn = $this->processor->createCheckIn(
            $program,
            'web',
            $structuredData,
            rawInput: $validated['note'] ?? null,
            imagePath: $imagePath,
        );

        return response()->json([
            'message' => 'Check-in received, thank you!',
            'check_in_id' => $checkIn->id,
        ], 201);
    }
}
