<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckIn extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'source',
        'raw_input',
        'structured_data',
        'image_path',
        'flagged',
        'flag_reason',
    ];

    protected function casts(): array
    {
        return [
            'structured_data' => 'array',
            'flagged' => 'boolean',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(MonitoringProgram::class, 'program_id');
    }
}
