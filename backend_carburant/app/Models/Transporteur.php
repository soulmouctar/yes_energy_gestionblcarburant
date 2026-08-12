<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transporteur extends Model
{
    use HasFactory;

    protected $table = 'transporteurs';

    protected $fillable = [
        'nom',
        'responsable',
        'telephone',
        'adresse',
    ];

    public function camions()
    {
        return $this->hasMany(Camion::class, 'transporteur_id');
    }

    public function chauffeurs()
    {
        return $this->hasMany(Chauffeur::class, 'transporteur_id');
    }

    public function bls()
    {
        return $this->hasMany(Bl::class, 'transporteur_id');
    }
}
