<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bl;
use App\Models\Camion;
use App\Models\Chauffeur;
use App\Models\Client;
use App\Models\Destination;
use App\Models\Transporteur;

class DashboardController extends Controller
{
    public function index()
    {
        $totalBl = Bl::count();
        $blEnCours = Bl::where('statut', 'En cours')->count();
        $blLivres = Bl::where('statut', 'Livré')->count();
        $blLiquides = Bl::where('statut', 'Liquidé')->count();
        $blAnnules = Bl::where('statut', 'Annulé')->count();

        $volumeEssence = Bl::where('produit', 'Essence')->sum('quantite');
        $volumeGasoil = Bl::where('produit', 'Gasoil')->sum('quantite');
        $volumeTotal = $volumeEssence + $volumeGasoil;

        $camionsActifs = Camion::where('etat', 'Actif')->count();
        $chauffeursCount = Chauffeur::count();
        $clientsCount = Client::count();
        $transporteursCount = Transporteur::count();

        // Top 5 destinations by BL count
        $topDestinations = Destination::withCount('bls')
            ->orderBy('bls_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($dst) {
                $volEssence = Bl::where('destination_id', $dst->id)->where('produit', 'Essence')->sum('quantite');
                $volGasoil = Bl::where('destination_id', $dst->id)->where('produit', 'Gasoil')->sum('quantite');
                return [
                    'id' => $dst->id,
                    'nom' => $dst->nom,
                    'region' => $dst->region,
                    'bl_count' => $dst->bls_count,
                    'volume_essence' => (float)$volEssence,
                    'volume_gasoil' => (float)$volGasoil,
                    'volume_total' => (float)($volEssence + $volGasoil),
                ];
            });

        // Top 5 transporteurs
        $topTransporteurs = Transporteur::withCount('bls')
            ->orderBy('bls_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($trp) {
                $vol = Bl::where('transporteur_id', $trp->id)->sum('quantite');
                return [
                    'id' => $trp->id,
                    'nom' => $trp->nom,
                    'responsable' => $trp->responsable,
                    'bl_count' => $trp->bls_count,
                    'volume_total' => (float)$vol,
                ];
            });

        // Top 5 clients
        $topClients = Client::withCount('bls')
            ->orderBy('bls_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($cli) {
                $vol = Bl::where('client_id', $cli->id)->sum('quantite');
                return [
                    'id' => $cli->id,
                    'nom' => $cli->nom,
                    'bl_count' => $cli->bls_count,
                    'volume_total' => (float)$vol,
                ];
            });

        // Recent 5 BLs
        $derniersBl = Bl::with(['camion', 'chauffeur', 'client', 'destination', 'transporteur'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Monthly Breakdown for Charts (Last 6 Months) - Universal year & month filter
        $monthlyChartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $year = $date->year;
            $month = $date->month;
            $monthLabel = $date->translatedFormat('M Y');

            $essence = Bl::where('produit', 'Essence')
                ->whereYear('date_bl', $year)
                ->whereMonth('date_bl', $month)
                ->sum('quantite');

            $gasoil = Bl::where('produit', 'Gasoil')
                ->whereYear('date_bl', $year)
                ->whereMonth('date_bl', $month)
                ->sum('quantite');

            $monthlyChartData[] = [
                'month' => ucfirst($monthLabel),
                'Essence' => (float)$essence,
                'Gasoil' => (float)$gasoil,
                'Total' => (float)($essence + $gasoil),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_bl' => $totalBl,
                'bl_en_cours' => $blEnCours,
                'bl_livres' => $blLivres,
                'bl_liquides' => $blLiquides,
                'bl_annules' => $blAnnules,
                'volume_essence' => (float)$volumeEssence,
                'volume_gasoil' => (float)$volumeGasoil,
                'volume_total' => (float)$volumeTotal,
                'camions_actifs' => $camionsActifs,
                'chauffeurs_count' => $chauffeursCount,
                'clients_count' => $clientsCount,
                'transporteurs_count' => $transporteursCount,
                'top_destinations' => $topDestinations,
                'top_transporteurs' => $topTransporteurs,
                'top_clients' => $topClients,
                'derniers_bl' => $derniersBl,
                'monthly_chart' => $monthlyChartData,
            ],
        ]);
    }
}
