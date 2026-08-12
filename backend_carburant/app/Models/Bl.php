<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bl extends Model
{
    use HasFactory;

    protected $table = 'bl';

    protected $fillable = [
        'numero_bl',
        'date_bl',
        'camion_id',
        'chauffeur_id',
        'client_id',
        'destination_id',
        'transporteur_id',
        'produit',
        'quantite',
        'prix_transport',
        'date_livraison',
        'date_liquidation',
        'statut',
        'observation',
        'created_by',
        'updated_by',
    ];

    public function camion()
    {
        return $this->belongsTo(Camion::class, 'camion_id');
    }

    public function chauffeur()
    {
        return $this->belongsTo(Chauffeur::class, 'chauffeur_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id');
    }

    public function transporteur()
    {
        return $this->belongsTo(Transporteur::class, 'transporteur_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
