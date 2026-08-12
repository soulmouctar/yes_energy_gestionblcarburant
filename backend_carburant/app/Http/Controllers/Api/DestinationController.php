<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Destination;
use App\Models\Bl;
use App\Services\ActivityLogger;

class DestinationController extends Controller
{
    public function index()
    {
        $destinations = Destination::withCount('bls')->orderBy('nom')->get()->map(function ($dest) {
            $dest->volume_essence = Bl::where('destination_id', $dest->id)->where('produit', 'Essence')->sum('quantite');
            $dest->volume_gasoil = Bl::where('destination_id', $dest->id)->where('produit', 'Gasoil')->sum('quantite');
            $dest->volume_total = $dest->volume_essence + $dest->volume_gasoil;
            return $dest;
        });

        return response()->json(['success' => true, 'data' => $destinations]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'region' => 'nullable|string',
            'distance' => 'nullable|numeric|min:0',
        ]);

        $destination = Destination::create($validated);

        ActivityLogger::log('CREATE', 'destinations', $destination->id, 'Ajout de la destination ' . $destination->nom);

        return response()->json(['success' => true, 'message' => 'Destination enregistrée avec succès', 'data' => $destination], 201);
    }

    public function show($id)
    {
        $destination = Destination::with(['bls.client', 'bls.camion', 'bls.chauffeur', 'bls.transporteur'])->find($id);
        if (!$destination) {
            return response()->json(['success' => false, 'message' => 'Destination non trouvée'], 404);
        }

        $destination->volume_essence = Bl::where('destination_id', $destination->id)->where('produit', 'Essence')->sum('quantite');
        $destination->volume_gasoil = Bl::where('destination_id', $destination->id)->where('produit', 'Gasoil')->sum('quantite');

        return response()->json(['success' => true, 'data' => $destination]);
    }

    public function update(Request $request, $id)
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return response()->json(['success' => false, 'message' => 'Destination non trouvée'], 404);
        }

        $validated = $request->validate([
            'nom' => 'required|string',
            'region' => 'nullable|string',
            'distance' => 'nullable|numeric|min:0',
        ]);

        $destination->update($validated);

        ActivityLogger::log('UPDATE', 'destinations', $destination->id, 'Mise à jour de la destination ' . $destination->nom);

        return response()->json(['success' => true, 'message' => 'Destination mise à jour avec succès', 'data' => $destination]);
    }

    public function destroy($id)
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return response()->json(['success' => false, 'message' => 'Destination non trouvée'], 404);
        }

        if ($destination->bls()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Impossible de supprimer cette destination car des BLs y sont associés.'], 422);
        }

        $nom = $destination->nom;
        $destination->delete();

        ActivityLogger::log('DELETE', 'destinations', $id, 'Suppression de la destination ' . $nom);

        return response()->json(['success' => true, 'message' => 'Destination supprimée avec succès']);
    }
}
