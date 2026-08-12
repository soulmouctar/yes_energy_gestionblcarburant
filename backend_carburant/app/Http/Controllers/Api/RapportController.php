<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bl;

class RapportController extends Controller
{
    public function generate(Request $request)
    {
        $query = Bl::with(['camion', 'chauffeur', 'client', 'destination', 'transporteur']);

        if ($request->filled('date_debut')) {
            $query->whereDate('date_bl', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_bl', '<=', $request->date_fin);
        }

        if ($request->filled('produit') && $request->produit !== 'all') {
            $query->where('produit', $request->produit);
        }

        if ($request->filled('client_id') && $request->client_id !== 'all') {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('destination_id') && $request->destination_id !== 'all') {
            $query->where('destination_id', $request->destination_id);
        }

        if ($request->filled('transporteur_id') && $request->transporteur_id !== 'all') {
            $query->where('transporteur_id', $request->transporteur_id);
        }

        if ($request->filled('camion_id') && $request->camion_id !== 'all') {
            $query->where('camion_id', $request->camion_id);
        }

        if ($request->filled('chauffeur_id') && $request->chauffeur_id !== 'all') {
            $query->where('chauffeur_id', $request->chauffeur_id);
        }

        if ($request->filled('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        $bls = $query->orderBy('date_bl', 'desc')->get();

        $totalBl = $bls->count();
        $volumeEssence = $bls->where('produit', 'Essence')->sum('quantite');
        $volumeGasoil = $bls->where('produit', 'Gasoil')->sum('quantite');
        $totalVolume = $volumeEssence + $volumeGasoil;
        $totalPrixTransport = $bls->sum('prix_transport');

        // Distribution by Product
        $byProduct = [
            ['name' => 'Essence', 'volume' => (float)$volumeEssence, 'count' => $bls->where('produit', 'Essence')->count()],
            ['name' => 'Gasoil', 'volume' => (float)$volumeGasoil, 'count' => $bls->where('produit', 'Gasoil')->count()],
        ];

        // Distribution by Status
        $byStatus = [
            ['name' => 'En cours', 'count' => $bls->where('statut', 'En cours')->count()],
            ['name' => 'Livré', 'count' => $bls->where('statut', 'Livré')->count()],
            ['name' => 'Liquidé', 'count' => $bls->where('statut', 'Liquidé')->count()],
            ['name' => 'Annulé', 'count' => $bls->where('statut', 'Annulé')->count()],
        ];

        // Distribution by Destination
        $byDestination = $bls->groupBy('destination_id')->map(function ($group) {
            $first = $group->first();
            return [
                'name' => $first->destination ? $first->destination->nom : 'N/A',
                'volume' => (float)$group->sum('quantite'),
                'count' => $group->count(),
            ];
        })->values()->sortByDesc('volume')->take(5)->values();

        // Distribution by Transporteur
        $byTransporteur = $bls->groupBy('transporteur_id')->map(function ($group) {
            $first = $group->first();
            return [
                'name' => $first->transporteur ? $first->transporteur->nom : 'N/A',
                'volume' => (float)$group->sum('quantite'),
                'count' => $group->count(),
            ];
        })->values()->sortByDesc('volume')->take(5)->values();

        return response()->json([
            'success' => true,
            'summary' => [
                'total_bl' => $totalBl,
                'volume_essence' => (float)$volumeEssence,
                'volume_gasoil' => (float)$volumeGasoil,
                'total_volume' => (float)$totalVolume,
                'total_prix_transport' => (float)$totalPrixTransport,
            ],
            'by_product' => $byProduct,
            'by_status' => $byStatus,
            'by_destination' => $byDestination,
            'by_transporteur' => $byTransporteur,
            'data' => $bls,
        ]);
    }
}
