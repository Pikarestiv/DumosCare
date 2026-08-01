<?php

namespace App\Console\Commands;

use App\Mail\ReminderMail;
use App\Models\Reminder;
use App\Services\WhatsAppCloudApi;
use Carbon\Carbon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

#[Signature('app:dispatch-reminders')]
#[Description('Send WhatsApp/email reminders that are due and roll them to the next scheduled time')]
class DispatchReminders extends Command
{
    public function handle()
    {
        $whatsApp = WhatsAppCloudApi::make();

        $due = Reminder::with('program.patient')
            ->where('next_due_at', '<=', now())
            ->get();

        $this->info("Found {$due->count()} due reminder(s).");

        foreach ($due as $reminder) {
            $patient = $reminder->program->patient;
            $message = $this->renderMessage($reminder->message_template, $patient->name);

            match ($reminder->channel) {
                'whatsapp' => $whatsApp->sendText($patient->phone, $message),
                'email' => Mail::to("patient-{$patient->id}@dumoscare.test")->send(new ReminderMail($message)),
                // 'sms' is deferred until the product is monetized — not implemented.
                default => $this->warn("Unsupported reminder channel [{$reminder->channel}], skipping."),
            };

            $reminder->update([
                'last_sent_at' => now(),
                'next_due_at' => $this->nextDueAt($reminder->frequency, $reminder->next_due_at),
            ]);
        }
    }

    private function renderMessage(string $template, string $patientName): string
    {
        return str_replace('{name}', $patientName, $template);
    }

    private function nextDueAt(string $frequency, Carbon $from): Carbon
    {
        return match ($frequency) {
            'twice_daily' => $from->copy()->addHours(12),
            'weekly' => $from->copy()->addWeek(),
            default => $from->copy()->addDay(),
        };
    }
}
