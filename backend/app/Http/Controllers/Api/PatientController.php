<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $patients = Patient::query()
            ->withCount(['programs as active_programs_count' => fn ($q) => $q->where('status', 'active')])
            ->with(['programs' => fn ($q) => $q->where('status', 'active')])
            ->get()
            ->map(function (Patient $patient) {
                $lastCheckIn = \App\Models\CheckIn::whereIn('program_id', $patient->programs->pluck('id'))
                    ->latest()
                    ->first();

                $flaggedCount = \App\Models\CheckIn::whereIn(
                    'program_id',
                    $patient->programs()->pluck('id')
                )->where('flagged', true)->count();

                return [
                    'id' => $patient->id,
                    'name' => $patient->name,
                    'phone' => $patient->phone,
                    'report_token' => $patient->report_token,
                    'active_programs' => $patient->programs->pluck('type'),
                    'last_check_in_at' => $lastCheckIn?->created_at,
                    'flagged_count' => $flaggedCount,
                ];
            });

        return response()->json($patients);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:32',
        ]);

        $patient = Patient::create([
            ...$validated,
            'provider_id' => $request->user()->provider_id,
        ]);

        return response()->json($patient, 201);
    }

    public function show(Patient $patient)
    {
        $patient->load(['programs.checkIns' => fn ($q) => $q->latest(), 'programs.reminders']);

        return response()->json($patient);
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:32',
        ]);

        $patient->update($validated);

        return response()->json($patient);
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return response()->json(null, 204);
    }
}
