<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'name',
        'phone',
        'report_token',
    ];

    protected static function booted(): void
    {
        static::creating(function (Patient $patient) {
            if (empty($patient->report_token)) {
                $patient->report_token = Str::random(40);
            }
        });
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function programs(): HasMany
    {
        return $this->hasMany(MonitoringProgram::class);
    }

    public function activePrograms(): HasMany
    {
        return $this->programs()->where('status', 'active');
    }
}
