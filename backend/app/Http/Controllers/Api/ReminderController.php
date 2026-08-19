<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonitoringProgram;
use App\Models\Reminder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReminderController extends Controller
{
    public function index()
    {
        $reminders = Reminder::query()
            ->with('program.patient')
            ->orderBy('next_due_at')
            ->get();

        return response()->json($reminders);
    }

    public function store(Request $request, MonitoringProgram $program)
    {
        $validated = $request->validate([
            'channel' => ['required', Rule::in(['whatsapp', 'email'])],
            'frequency' => ['required', Rule::in(['daily', 'twice_daily', 'weekly'])],
            'time_of_day' => 'required|date_format:H:i',
            'message_template' => 'required|string|max:1000',
        ]);

        $reminder = $program->reminders()->create([
            ...$validated,
            'next_due_at' => $this->nextDueAt($validated['time_of_day']),
        ]);

        return response()->json($reminder, 201);
    }

    public function update(Request $request, Reminder $reminder)
    {
        $validated = $request->validate([
            'channel' => ['sometimes', Rule::in(['whatsapp', 'email'])],
            'frequency' => ['sometimes', Rule::in(['daily', 'twice_daily', 'weekly'])],
            'time_of_day' => 'sometimes|date_format:H:i',
            'message_template' => 'sometimes|string|max:1000',
        ]);

        $reminder->update($validated);

        return response()->json($reminder);
    }

    public function destroy(Reminder $reminder)
    {
        $reminder->delete();

        return response()->json(null, 204);
    }

    private function nextDueAt(string $timeOfDay): Carbon
    {
        $next = Carbon::createFromFormat('H:i', $timeOfDay)->seconds(0);

        if ($next->isPast()) {
            $next->addDay();
        }

        return $next;
    }
}
