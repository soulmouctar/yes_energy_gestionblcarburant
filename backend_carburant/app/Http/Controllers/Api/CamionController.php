<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Camion;
use App\Services\ActivityLogger;

class CamionController extends Controller
{
    public function index()
    {
        $camions = Camion::with(['transporteur', 'bls'])->withCount('bls')->orderBy('immatriculation')->get();

        return response()->json([
            'success' => true,
            'data' => $camions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'immatriculation' => 'required|string|unique:camions,immatriculation',
            'marque' => 'nullable|string',
            'capacite' => 'required|numeric|min:1',
            'type_citerne' => 'nullable|string',
            'transporteur_id' => 'required|exists:transporteurs,id',
            'etat' => 'required|in:Actif,En panne,En maintenance',
            'date_assurance' => 'nullable|date',
            'date_visite' => 'nullable|date',
        ]);

        $camion = Camion::create($validated);
        $camion->load('transporteur');

        ActivityLogger::log('CREATE', 'camions', $camion->id, 'Ajout du camion ' . $camion->immatriculation);

        return response()->json([
            'success' => true,
            'message' => 'Camion enregistré avec succès',
            'data' => $camion,
        ], 201);
    }

    public function show($id)
    {
        $camion = Camion::with(['transporteur', 'bls.client', 'bls.destination', 'bls.chauffeur'])->find($id);

        if (!$camion) {
            return response()->json(['success' => false, 'message' => 'Camion non trouvé'], 404);
        }

        return response()->json(['success' => true, 'data' => $camion]);
    }

    public function update(Request $request, $id)
    {
        $camion = Camion::find($id);
        if (!$camion) {
            return response()->json(['success' => false, 'message' => 'Camion non trouvé'], 404);
        }

        $validated = $request->validate([
            'immatriculation' => 'required|string|unique:camions,immatriculation,' . $id,
            'marque' => 'nullable|string',
            'capacite' => 'required|numeric|min:1',
            'type_citerne' => 'nullable|string',
            'transporteur_id' => 'required|exists:transporteurs,id',
            'etat' => 'required|in:Actif,En panne,En maintenance',
            'date_assurance' => 'nullable|date',
            'date_visite' => 'nullable|date',
        ]);

        $camion->update($validated);
        $camion->load('transporteur');

        ActivityLogger::log('UPDATE', 'camions', $camion->id, 'Mise à jour du camion ' . $camion->immatriculation);

        return response()->json(['success' => true, 'message' => 'Camion mis à jour avec succès', 'data' => $camion]);
    }

    public function destroy($id)
    {
        $camion = Camion::find($id);
        if (!$camion) {
            return response()->json(['success' => false, 'message' => 'Camion non trouvé'], 404);
        }

        if ($camion->bls()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Impossible de supprimer ce camion car des BLs y sont rattachés.'], 422);
        }

        $immat = $camion->immatriculation;
        $camion->delete();

        ActivityLogger::log('DELETE', 'camions', $id, 'Suppression du camion ' . $immat);

        return response()->json(['success' => true, 'message' => 'Camion supprimé avec succès']);
    }
}
