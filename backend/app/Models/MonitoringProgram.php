<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonitoringProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'type',
        'config',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class, 'program_id');
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class, 'program_id');
    }
}
