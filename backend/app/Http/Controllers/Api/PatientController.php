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
                $programIds = $patient->programs->pluck('id');

                $lastCheckIn = \App\Models\CheckIn::whereIn('program_id', $programIds)
                    ->latest()
                    ->first();

                $flaggedCount = \App\Models\CheckIn::whereIn('program_id', $programIds)
                    ->where('flagged', true)
                    ->count();

                $lastFlaggedAt = \App\Models\CheckIn::whereIn('program_id', $programIds)
                    ->where('flagged', true)
                    ->latest()
                    ->value('created_at');

                $since = now()->subDays(13)->startOfDay();
                $dailyCounts = \App\Models\CheckIn::whereIn('program_id', $programIds)
                    ->where('created_at', '>=', $since)
                    ->get()
                    ->groupBy(fn ($c) => $c->created_at->toDateString())
                    ->map->count();

                $activitySparkline = collect(range(0, 13))->map(function ($daysAgo) use ($dailyCounts) {
                    $date = now()->subDays(13 - $daysAgo)->toDateString();

                    return $dailyCounts->get($date, 0);
                })->values();

                return [
                    'id' => $patient->id,
                    'name' => $patient->name,
                    'phone' => $patient->phone,
                    'report_token' => $patient->report_token,
                    'active_programs' => $patient->programs->pluck('type'),
                    'last_check_in_at' => $lastCheckIn?->created_at,
                    'flagged_count' => $flaggedCount,
                    'last_flagged_at' => $lastFlaggedAt,
                    'activity_sparkline' => $activitySparkline,
                ];
            })
            ->sortByDesc(fn ($p) => [$p['flagged_count'] > 0, $p['last_flagged_at'] ?? $p['last_check_in_at'] ?? ''])
            ->values();

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
