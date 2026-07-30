<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provider extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'whatsapp_business_number',
    ];

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
