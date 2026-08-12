<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    use HasFactory;

    protected $table = 'destinations';

    protected $fillable = [
        'nom',
        'region',
        'distance',
    ];

    public function bls()
    {
        return $this->hasMany(Bl::class, 'destination_id');
    }
}
