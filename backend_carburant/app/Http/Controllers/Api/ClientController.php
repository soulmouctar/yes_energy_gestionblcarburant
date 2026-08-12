<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;
use App\Services\ActivityLogger;

class ClientController extends Controller
{
    public function index()
    {
        $clients = Client::withCount('bls')->orderBy('nom')->get()->map(function ($client) {
            $client->volume_total = $client->bls()->sum('quantite');
            return $client;
        });

        return response()->json([
            'success' => true,
            'data' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
            'contact' => 'nullable|string',
        ]);

        $client = Client::create($validated);

        ActivityLogger::log('CREATE', 'clients', $client->id, 'Ajout du client ' . $client->nom);

        return response()->json(['success' => true, 'message' => 'Client enregistré avec succès', 'data' => $client], 201);
    }

    public function show($id)
    {
        $client = Client::with(['bls.camion', 'bls.destination', 'bls.chauffeur', 'bls.transporteur'])->find($id);
        if (!$client) {
            return response()->json(['success' => false, 'message' => 'Client non trouvé'], 404);
        }
        $client->volume_total = $client->bls()->sum('quantite');
        return response()->json(['success' => true, 'data' => $client]);
    }

    public function update(Request $request, $id)
    {
        $client = Client::find($id);
        if (!$client) {
            return response()->json(['success' => false, 'message' => 'Client non trouvé'], 404);
        }

        $validated = $request->validate([
            'nom' => 'required|string',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
            'contact' => 'nullable|string',
        ]);

        $client->update($validated);

        ActivityLogger::log('UPDATE', 'clients', $client->id, 'Mise à jour du client ' . $client->nom);

        return response()->json(['success' => true, 'message' => 'Client mis à jour avec succès', 'data' => $client]);
    }

    public function destroy($id)
    {
        $client = Client::find($id);
        if (!$client) {
            return response()->json(['success' => false, 'message' => 'Client non trouvé'], 404);
        }

        if ($client->bls()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Impossible de supprimer ce client car des BLs y sont liés.'], 422);
        }

        $nom = $client->nom;
        $client->delete();

        ActivityLogger::log('DELETE', 'clients', $id, 'Suppression du client ' . $nom);

        return response()->json(['success' => true, 'message' => 'Client supprimé avec succès']);
    }
}
