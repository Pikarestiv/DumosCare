<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonitoringProgram;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MonitoringProgramController extends Controller
{
    public function store(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['blood_pressure', 'medication_adherence', 'wound_care', 'general_checkin'])],
            'config' => 'nullable|array',
            'status' => ['nullable', Rule::in(['active', 'paused', 'completed'])],
        ]);

        $program = $patient->programs()->create([
            'type' => $validated['type'],
            'config' => $validated['config'] ?? [],
            'status' => $validated['status'] ?? 'active',
            'created_by' => $request->user()->id,
        ]);

        return response()->json($program, 201);
    }

    public function update(Request $request, MonitoringProgram $program)
    {
        $validated = $request->validate([
            'config' => 'nullable|array',
            'status' => ['nullable', Rule::in(['active', 'paused', 'completed'])],
        ]);

        $program->update($validated);

        return response()->json($program);
    }

    public function destroy(MonitoringProgram $program)
    {
        $program->delete();

        return response()->json(null, 204);
    }
}
