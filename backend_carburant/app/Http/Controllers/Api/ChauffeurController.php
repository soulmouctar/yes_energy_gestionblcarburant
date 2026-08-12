<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Chauffeur;
use App\Services\ActivityLogger;

class ChauffeurController extends Controller
{
    public function index()
    {
        $chauffeurs = Chauffeur::with(['transporteur', 'bls'])->withCount('bls')->orderBy('nom')->get();

        return response()->json([
            'success' => true,
            'data' => $chauffeurs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'telephone' => 'nullable|string',
            'numero_permis' => 'nullable|string',
            'expiration_permis' => 'nullable|date',
            'transporteur_id' => 'nullable|exists:transporteurs,id',
        ]);

        $chauffeur = Chauffeur::create($validated);
        $chauffeur->load('transporteur');

        ActivityLogger::log('CREATE', 'chauffeurs', $chauffeur->id, 'Ajout du chauffeur ' . $chauffeur->nom);

        return response()->json([
            'success' => true,
            'message' => 'Chauffeur enregistré avec succès',
            'data' => $chauffeur,
        ], 201);
    }

    public function show($id)
    {
        $chauffeur = Chauffeur::with(['transporteur', 'bls.client', 'bls.destination', 'bls.camion'])->find($id);
        if (!$chauffeur) {
            return response()->json(['success' => false, 'message' => 'Chauffeur non trouvé'], 404);
        }
        return response()->json(['success' => true, 'data' => $chauffeur]);
    }

    public function update(Request $request, $id)
    {
        $chauffeur = Chauffeur::find($id);
        if (!$chauffeur) {
            return response()->json(['success' => false, 'message' => 'Chauffeur non trouvé'], 404);
        }

        $validated = $request->validate([
            'nom' => 'required|string',
            'telephone' => 'nullable|string',
            'numero_permis' => 'nullable|string',
            'expiration_permis' => 'nullable|date',
            'transporteur_id' => 'nullable|exists:transporteurs,id',
        ]);

        $chauffeur->update($validated);
        $chauffeur->load('transporteur');

        ActivityLogger::log('UPDATE', 'chauffeurs', $chauffeur->id, 'Mise à jour du chauffeur ' . $chauffeur->nom);

        return response()->json(['success' => true, 'message' => 'Chauffeur mis à jour avec succès', 'data' => $chauffeur]);
    }

    public function destroy($id)
    {
        $chauffeur = Chauffeur::find($id);
        if (!$chauffeur) {
            return response()->json(['success' => false, 'message' => 'Chauffeur non trouvé'], 404);
        }

        if ($chauffeur->bls()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Impossible de supprimer ce chauffeur car des BLs lui sont associés.'], 422);
        }

        $nom = $chauffeur->nom;
        $chauffeur->delete();

        ActivityLogger::log('DELETE', 'chauffeurs', $id, 'Suppression du chauffeur ' . $nom);

        return response()->json(['success' => true, 'message' => 'Chauffeur supprimé avec succès']);
    }
}
