<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bl;
use App\Services\ActivityLogger;

class BlController extends Controller
{
    public function index(Request $request)
    {
        $query = Bl::with(['camion', 'chauffeur', 'client', 'destination', 'transporteur']);

        // Search text
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_bl', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($cq) use ($search) {
                      $cq->where('nom', 'like', "%{$search}%");
                  })
                  ->orWhereHas('camion', function ($caq) use ($search) {
                      $caq->where('immatriculation', 'like', "%{$search}%");
                  })
                  ->orWhereHas('transporteur', function ($tq) use ($search) {
                      $tq->where('nom', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($request->filled('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        // Product filter
        if ($request->filled('produit') && $request->produit !== 'all') {
            $query->where('produit', $request->produit);
        }

        // Date range filter
        if ($request->filled('date_debut')) {
            $query->whereDate('date_bl', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_bl', '<=', $request->date_fin);
        }

        $bls = $query->orderBy('date_bl', 'desc')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $bls,
        ]);
    }

    public function generateNumber()
    {
        $year = date('Y');
        $lastBl = Bl::orderBy('id', 'desc')->first();
        $nextId = $lastBl ? ($lastBl->id + 1) : 1;
        $num = 'BL-' . $year . '-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

        while (Bl::where('numero_bl', $num)->exists()) {
            $nextId++;
            $num = 'BL-' . $year . '-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
        }

        return response()->json([
            'success' => true,
            'numero_bl' => $num,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_bl' => 'nullable|string|unique:bl,numero_bl',
            'date_bl' => 'required|date',
            'camion_id' => 'required|exists:camions,id',
            'chauffeur_id' => 'required|exists:chauffeurs,id',
            'client_id' => 'required|exists:clients,id',
            'destination_id' => 'required|exists:destinations,id',
            'transporteur_id' => 'required|exists:transporteurs,id',
            'produit' => 'required|in:Essence,Gasoil',
            'quantite' => 'required|numeric|min:1',
            'prix_transport' => 'nullable|numeric|min:0',
            'date_livraison' => 'nullable|date',
            'date_liquidation' => 'nullable|date',
            'statut' => 'nullable|in:En cours,Livré,Liquidé,Annulé',
            'observation' => 'nullable|string',
        ]);

        if (empty($validated['numero_bl'])) {
            $year = date('Y');
            $lastBl = Bl::orderBy('id', 'desc')->first();
            $nextNum = $lastBl ? ($lastBl->id + 1) : 1;
            $num = 'BL-' . $year . '-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
            while (Bl::where('numero_bl', $num)->exists()) {
                $nextNum++;
                $num = 'BL-' . $year . '-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
            }
            $validated['numero_bl'] = $num;
        }

        $validated['statut'] = $validated['statut'] ?? 'En cours';
        $validated['created_by'] = $request->user() ? $request->user()->id : null;

        $bl = Bl::create($validated);
        $bl->load(['camion', 'chauffeur', 'client', 'destination', 'transporteur']);

        ActivityLogger::log('CREATE', 'bl', $bl->id, 'Création du Bon de Livraison N° ' . $bl->numero_bl);

        return response()->json([
            'success' => true,
            'message' => 'Bon de Livraison créé avec succès',
            'data' => $bl,
        ], 201);
    }

    public function show($id)
    {
        $bl = Bl::with(['camion', 'chauffeur', 'client', 'destination', 'transporteur', 'creator', 'updater'])->find($id);

        if (!$bl) {
            return response()->json([
                'success' => false,
                'message' => 'Bon de Livraison introuvable',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $bl,
        ]);
    }

    public function update(Request $request, $id)
    {
        $bl = Bl::find($id);

        if (!$bl) {
            return response()->json([
                'success' => false,
                'message' => 'Bon de Livraison introuvable',
            ], 404);
        }

        $validated = $request->validate([
            'numero_bl' => 'required|string|unique:bl,numero_bl,' . $id,
            'date_bl' => 'required|date',
            'camion_id' => 'required|exists:camions,id',
            'chauffeur_id' => 'required|exists:chauffeurs,id',
            'client_id' => 'required|exists:clients,id',
            'destination_id' => 'required|exists:destinations,id',
            'transporteur_id' => 'required|exists:transporteurs,id',
            'produit' => 'required|in:Essence,Gasoil',
            'quantite' => 'required|numeric|min:1',
            'prix_transport' => 'nullable|numeric|min:0',
            'date_livraison' => 'nullable|date',
            'date_liquidation' => 'nullable|date',
            'statut' => 'required|in:En cours,Livré,Liquidé,Annulé',
            'observation' => 'nullable|string',
        ]);

        $validated['updated_by'] = $request->user() ? $request->user()->id : null;

        $bl->update($validated);
        $bl->load(['camion', 'chauffeur', 'client', 'destination', 'transporteur']);

        ActivityLogger::log('UPDATE', 'bl', $bl->id, 'Mise à jour du Bon de Livraison N° ' . $bl->numero_bl);

        return response()->json([
            'success' => true,
            'message' => 'Bon de Livraison mis à jour avec succès',
            'data' => $bl,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $bl = Bl::find($id);

        if (!$bl) {
            return response()->json([
                'success' => false,
                'message' => 'Bon de Livraison introuvable',
            ], 404);
        }

        $num = $bl->numero_bl;
        $bl->delete();

        ActivityLogger::log('DELETE', 'bl', $id, 'Suppression du Bon de Livraison N° ' . $num);

        return response()->json([
            'success' => true,
            'message' => 'Bon de Livraison supprimé avec succès',
        ]);
    }

    public function duplicate(Request $request, $id)
    {
        $original = Bl::find($id);
        if (!$original) {
            return response()->json(['success' => false, 'message' => 'BL introuvable'], 404);
        }

        $year = date('Y');
        $lastBl = Bl::orderBy('id', 'desc')->first();
        $nextNum = $lastBl ? ($lastBl->id + 1) : 1;
        $newNumero = 'BL-' . $year . '-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
        while (Bl::where('numero_bl', $newNumero)->exists()) {
            $nextNum++;
            $newNumero = 'BL-' . $year . '-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
        }

        $newBl = $original->replicate();
        $newBl->numero_bl = $newNumero;
        $newBl->date_bl = date('Y-m-d');
        $newBl->statut = 'En cours';
        $newBl->date_livraison = null;
        $newBl->date_liquidation = null;
        $newBl->created_by = $request->user() ? $request->user()->id : null;
        $newBl->updated_by = null;
        $newBl->save();

        $newBl->load(['camion', 'chauffeur', 'client', 'destination', 'transporteur']);

        ActivityLogger::log('DUPLICATE', 'bl', $newBl->id, 'Duplication du BL N° ' . $original->numero_bl . ' vers ' . $newBl->numero_bl);

        return response()->json([
            'success' => true,
            'message' => 'Bon de Livraison duplicé avec succès',
            'data' => $newBl,
        ]);
    }
}
