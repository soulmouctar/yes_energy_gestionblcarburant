<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chauffeur extends Model
{
    use HasFactory;

    protected $table = 'chauffeurs';

    protected $fillable = [
        'nom',
        'telephone',
        'numero_permis',
        'expiration_permis',
        'transporteur_id',
    ];

    public function transporteur()
    {
        return $this->belongsTo(Transporteur::class, 'transporteur_id');
    }

    public function bls()
    {
        return $this->hasMany(Bl::class, 'chauffeur_id');
    }
}
