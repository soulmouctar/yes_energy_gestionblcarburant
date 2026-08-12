<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transporteur;
use App\Models\Bl;
use App\Services\ActivityLogger;

class TransporteurController extends Controller
{
    public function index()
    {
        $transporteurs = Transporteur::withCount(['camions', 'chauffeurs', 'bls'])->orderBy('nom')->get()->map(function ($t) {
            $t->volume_total = Bl::where('transporteur_id', $t->id)->sum('quantite');
            return $t;
        });

        return response()->json(['success' => true, 'data' => $transporteurs]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'responsable' => 'nullable|string',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
        ]);

        $transporteur = Transporteur::create($validated);

        ActivityLogger::log('CREATE', 'transporteurs', $transporteur->id, 'Ajout du transporteur ' . $transporteur->nom);

        return response()->json(['success' => true, 'message' => 'Transporteur enregistré avec succès', 'data' => $transporteur], 201);
    }

    public function show($id)
    {
        $transporteur = Transporteur::with(['camions', 'chauffeurs', 'bls.client', 'bls.destination'])->find($id);
        if (!$transporteur) {
            return response()->json(['success' => false, 'message' => 'Transporteur non trouvé'], 404);
        }

        $transporteur->volume_total = Bl::where('transporteur_id', $transporteur->id)->sum('quantite');

        return response()->json(['success' => true, 'data' => $transporteur]);
    }

    public function update(Request $request, $id)
    {
        $transporteur = Transporteur::find($id);
        if (!$transporteur) {
            return response()->json(['success' => false, 'message' => 'Transporteur non trouvé'], 404);
        }

        $validated = $request->validate([
            'nom' => 'required|string',
            'responsable' => 'nullable|string',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
        ]);

        $transporteur->update($validated);

        ActivityLogger::log('UPDATE', 'transporteurs', $transporteur->id, 'Mise à jour du transporteur ' . $transporteur->nom);

        return response()->json(['success' => true, 'message' => 'Transporteur mis à jour avec succès', 'data' => $transporteur]);
    }

    public function destroy($id)
    {
        $transporteur = Transporteur::find($id);
        if (!$transporteur) {
            return response()->json(['success' => false, 'message' => 'Transporteur non trouvé'], 404);
        }

        if ($transporteur->camions()->count() > 0 || $transporteur->bls()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Impossible de supprimer ce transporteur car des camions ou BLs y sont rattachés.'], 422);
        }

        $nom = $transporteur->nom;
        $transporteur->delete();

        ActivityLogger::log('DELETE', 'transporteurs', $id, 'Suppression du transporteur ' . $nom);

        return response()->json(['success' => true, 'message' => 'Transporteur supprimé avec succès']);
    }
}
