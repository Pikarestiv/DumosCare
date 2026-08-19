<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use App\Models\MonitoringProgram;
use App\Models\Patient;
use App\Models\Reminder;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function summary()
    {
        return response()->json([
            'active_patients' => Patient::whereHas('programs', fn ($q) => $q->where('status', 'active'))->count(),
            'flagged_check_ins_today' => CheckIn::where('flagged', true)
                ->whereDate('created_at', Carbon::today())
                ->count(),
            'overdue_reminders' => Reminder::where('next_due_at', '<', now())->count(),
        ]);
    }

    public function analytics()
    {
        $since = now()->subDays(13)->startOfDay();

        $recentCheckIns = CheckIn::where('created_at', '>=', $since)->get(['created_at', 'flagged']);

        $byDay = $recentCheckIns->groupBy(fn ($c) => $c->created_at->toDateString());

        $dailyCheckIns = collect(range(0, 13))->map(function ($daysAgo) use ($byDay) {
            $date = now()->subDays(13 - $daysAgo)->toDateString();
            $dayCheckIns = $byDay->get($date, collect());

            return [
                'date' => $date,
                'count' => $dayCheckIns->count(),
                'flagged' => $dayCheckIns->where('flagged', true)->count(),
            ];
        });

        $programBreakdown = MonitoringProgram::where('status', 'active')
            ->selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type');

        return response()->json([
            'daily_check_ins' => $dailyCheckIns,
            'program_breakdown' => $programBreakdown,
            'total_check_ins_14d' => $recentCheckIns->count(),
            'flagged_check_ins_14d' => $recentCheckIns->where('flagged', true)->count(),
        ]);
    }
}
