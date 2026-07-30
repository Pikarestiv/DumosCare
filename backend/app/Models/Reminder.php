<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'channel',
        'frequency',
        'time_of_day',
        'message_template',
        'last_sent_at',
        'next_due_at',
    ];

    protected function casts(): array
    {
        return [
            'last_sent_at' => 'datetime',
            'next_due_at' => 'datetime',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(MonitoringProgram::class, 'program_id');
    }
}
