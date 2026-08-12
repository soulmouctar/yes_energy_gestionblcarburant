<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bl;
use App\Services\ActivityLogger;

class LiquidationController extends Controller
{
    public function index(Request $request)
    {
        $query = Bl::with(['camion', 'chauffeur', 'client', 'destination', 'transporteur']);

        $filter = $request->query('filter', 'pending'); // 'pending' = En cours/Livré, 'liquidated' = Liquidé, 'all' = All

        if ($filter === 'pending') {
            $query->whereIn('statut', ['En cours', 'Livré']);
        } elseif ($filter === 'liquidated') {
            $query->where('statut', 'Liquidé');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_bl', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($cq) use ($search) {
                      $cq->where('nom', 'like', "%{$search}%");
                  })
                  ->orWhereHas('destination', function ($dq) use ($search) {
                      $dq->where('nom', 'like', "%{$search}%");
                  });
            });
        }

        $bls = $query->orderBy('date_bl', 'desc')->get();

        $stats = [
            'total_pending' => Bl::whereIn('statut', ['En cours', 'Livré'])->count(),
            'total_liquidated' => Bl::where('statut', 'Liquidé')->count(),
            'volume_pending' => (float)Bl::whereIn('statut', ['En cours', 'Livré'])->sum('quantite'),
            'volume_liquidated' => (float)Bl::where('statut', 'Liquidé')->sum('quantite'),
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'data' => $bls,
        ]);
    }

    public function liquider(Request $request, $id)
    {
        $bl = Bl::find($id);
        if (!$bl) {
            return response()->json(['success' => false, 'message' => 'BL non trouvé'], 404);
        }

        $validated = $request->validate([
            'date_liquidation' => 'required|date',
            'date_livraison' => 'nullable|date',
            'observation' => 'nullable|string',
        ]);

        $bl->statut = 'Liquidé';
        $bl->date_liquidation = $validated['date_liquidation'];
        if (!empty($validated['date_livraison'])) {
            $bl->date_livraison = $validated['date_livraison'];
        }
        if (isset($validated['observation'])) {
            $bl->observation = $validated['observation'];
        }
        $bl->updated_by = $request->user() ? $request->user()->id : null;
        $bl->save();

        ActivityLogger::log('LIQUIDATE', 'bl', $bl->id, 'Liquidation du Bon de Livraison N° ' . $bl->numero_bl);

        return response()->json([
            'success' => true,
            'message' => 'BL N° ' . $bl->numero_bl . ' liquidé avec succès',
            'data' => $bl,
        ]);
    }

    public function bulkLiquider(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:bl,id',
            'date_liquidation' => 'required|date',
            'observation' => 'nullable|string',
        ]);

        $count = 0;
        foreach ($validated['ids'] as $id) {
            $bl = Bl::find($id);
            if ($bl && $bl->statut !== 'Liquidé') {
                $bl->statut = 'Liquidé';
                $bl->date_liquidation = $validated['date_liquidation'];
                if (!empty($validated['observation'])) {
                    $bl->observation = ($bl->observation ? $bl->observation . ' | ' : '') . $validated['observation'];
                }
                $bl->updated_by = $request->user() ? $request->user()->id : null;
                $bl->save();
                $count++;
            }
        }

        ActivityLogger::log('BULK_LIQUIDATE', 'bl', null, "Liquidation groupée de {$count} Bons de Livraison");

        return response()->json([
            'success' => true,
            'message' => "{$count} Bons de Livraison ont été liquidés avec succès",
        ]);
    }
}
