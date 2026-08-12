<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Camion extends Model
{
    use HasFactory;

    protected $table = 'camions';

    protected $fillable = [
        'immatriculation',
        'marque',
        'capacite',
        'type_citerne',
        'transporteur_id',
        'etat',
        'date_assurance',
        'date_visite',
    ];

    public function transporteur()
    {
        return $this->belongsTo(Transporteur::class, 'transporteur_id');
    }

    public function bls()
    {
        return $this->hasMany(Bl::class, 'camion_id');
    }
}
