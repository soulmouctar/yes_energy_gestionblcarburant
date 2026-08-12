<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $table = 'clients';

    protected $fillable = [
        'nom',
        'telephone',
        'adresse',
        'contact',
    ];

    public function bls()
    {
        return $this->hasMany(Bl::class, 'client_id');
    }
}
