<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckIn;
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
}
