<?php

namespace Database\Seeders;

use App\Models\CheckIn;
use App\Models\MonitoringProgram;
use App\Models\Patient;
use App\Models\Provider;
use App\Models\Reminder;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $provider = Provider::create([
            'name' => 'Riverside Family Pharmacy',
            'whatsapp_business_number' => '+15550001234',
        ]);

        $admin = User::create([
            'name' => 'Amara Okafor',
            'email' => 'admin@pingura.test',
            'password' => Hash::make('password'),
            'provider_id' => $provider->id,
        ]);

        $patients = [
            [
                'name' => 'Grace Adeyemi',
                'phone' => '+15551230001',
                'report_token' => 'demo-grace-adeyemi-token',
                'programs' => [
                    [
                        'type' => 'blood_pressure',
                        'config' => ['target_systolic_high' => 140, 'target_systolic_low' => 90, 'target_diastolic_high' => 90, 'target_diastolic_low' => 60],
                        'checkins' => [
                            ['days_ago' => 6, 'systolic' => 122, 'diastolic' => 78],
                            ['days_ago' => 4, 'systolic' => 128, 'diastolic' => 82],
                            ['days_ago' => 2, 'systolic' => 148, 'diastolic' => 94],
                            ['days_ago' => 1, 'systolic' => 118, 'diastolic' => 76],
                        ],
                        'reminder' => ['channel' => 'whatsapp', 'frequency' => 'daily', 'time_of_day' => '08:00', 'message_template' => 'Hi {name}, please share your blood pressure reading for today.'],
                    ],
                ],
            ],
            [
                'name' => 'Emeka Nwosu',
                'phone' => '+15551230002',
                'report_token' => 'demo-emeka-nwosu-token',
                'programs' => [
                    [
                        'type' => 'medication_adherence',
                        'config' => ['medication' => 'Metformin 500mg', 'schedule' => 'Twice daily, morning and evening'],
                        'checkins' => [
                            ['days_ago' => 5, 'taken' => true],
                            ['days_ago' => 4, 'taken' => true],
                            ['days_ago' => 3, 'taken' => false],
                            ['days_ago' => 1, 'taken' => true],
                        ],
                        'reminder' => ['channel' => 'whatsapp', 'frequency' => 'twice_daily', 'time_of_day' => '09:00', 'message_template' => 'Hi {name}, have you taken your Metformin dose?'],
                    ],
                ],
            ],
            [
                'name' => 'Chiamaka Bello',
                'phone' => '+15551230003',
                'report_token' => 'demo-chiamaka-bello-token',
                'programs' => [
                    [
                        'type' => 'wound_care',
                        'config' => ['site' => 'Left lower leg, post-surgical'],
                        'checkins' => [
                            ['days_ago' => 7, 'note' => 'Healing well, less redness.'],
                            ['days_ago' => 3, 'note' => 'Slight swelling and warmth around the wound edges.', 'flagged' => true, 'flag_reason' => 'Patient-reported swelling/warmth, possible infection'],
                        ],
                        'reminder' => ['channel' => 'email', 'frequency' => 'weekly', 'time_of_day' => '10:00', 'message_template' => 'Hi {name}, please send an updated wound photo this week.'],
                    ],
                ],
            ],
            [
                'name' => 'Tunde Balogun',
                'phone' => '+15551230004',
                'report_token' => 'demo-tunde-balogun-token',
                'programs' => [
                    [
                        'type' => 'general_checkin',
                        'config' => [],
                        'checkins' => [
                            ['days_ago' => 2, 'note' => 'Feeling well, no complaints this week.'],
                        ],
                        'reminder' => null,
                    ],
                    [
                        'type' => 'blood_pressure',
                        'config' => ['target_systolic_high' => 140, 'target_systolic_low' => 90, 'target_diastolic_high' => 90, 'target_diastolic_low' => 60],
                        'checkins' => [
                            ['days_ago' => 3, 'systolic' => 152, 'diastolic' => 98],
                        ],
                        'reminder' => ['channel' => 'whatsapp', 'frequency' => 'daily', 'time_of_day' => '07:30', 'message_template' => 'Hi {name}, time for your daily BP check-in.'],
                    ],
                ],
            ],
        ];

        foreach ($patients as $patientData) {
            $patient = Patient::create([
                'provider_id' => $provider->id,
                'name' => $patientData['name'],
                'phone' => $patientData['phone'],
                'report_token' => $patientData['report_token'],
            ]);

            foreach ($patientData['programs'] as $programData) {
                $program = MonitoringProgram::create([
                    'patient_id' => $patient->id,
                    'type' => $programData['type'],
                    'config' => $programData['config'],
                    'status' => 'active',
                    'created_by' => $admin->id,
                ]);

                foreach ($programData['checkins'] as $checkinData) {
                    $daysAgo = $checkinData['days_ago'];
                    unset($checkinData['days_ago']);
                    $flagged = $checkinData['flagged'] ?? false;
                    $flagReason = $checkinData['flag_reason'] ?? null;
                    unset($checkinData['flagged'], $checkinData['flag_reason']);

                    if (! $flagged) {
                        if ($program->type === 'blood_pressure' && isset($checkinData['systolic'])) {
                            $flagged = $checkinData['systolic'] > 140 || $checkinData['systolic'] < 90
                                || $checkinData['diastolic'] > 90 || $checkinData['diastolic'] < 60;
                            $flagReason = $flagged ? 'Blood pressure reading outside target range' : null;
                        } elseif ($program->type === 'medication_adherence' && isset($checkinData['taken'])) {
                            $flagged = $checkinData['taken'] === false;
                            $flagReason = $flagged ? 'Medication not taken' : null;
                        }
                    }

                    $checkIn = CheckIn::create([
                        'program_id' => $program->id,
                        'source' => 'whatsapp',
                        'raw_input' => $checkinData['note'] ?? null,
                        'structured_data' => $checkinData,
                        'flagged' => $flagged,
                        'flag_reason' => $flagReason,
                    ]);

                    $checkIn->forceFill(['created_at' => now()->subDays($daysAgo), 'updated_at' => now()->subDays($daysAgo)])->save();
                }

                if ($programData['reminder']) {
                    Reminder::create([
                        'program_id' => $program->id,
                        'channel' => $programData['reminder']['channel'],
                        'frequency' => $programData['reminder']['frequency'],
                        'time_of_day' => $programData['reminder']['time_of_day'],
                        'message_template' => $programData['reminder']['message_template'],
                        'next_due_at' => now()->addHours(2),
                    ]);
                }
            }
        }

        $this->command->info('Seeded provider, 4 patients, programs, check-ins, and reminders.');
        $this->command->info('Admin login: admin@pingura.test / password');
    }
}
