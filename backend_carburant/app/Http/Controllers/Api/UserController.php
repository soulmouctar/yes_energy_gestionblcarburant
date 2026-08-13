<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Services\ActivityLogger;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'avatar', 'created_at')->orderBy('id', 'desc')->get();
        return response()->json(['success' => true, 'data' => $users]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,exploitation,consultation',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'avatar' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        // Handle uploaded real photo file from device
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Primary upload location (public/uploads/avatars)
            $publicDir = public_path('uploads/avatars');
            if (!file_exists($publicDir)) {
                @mkdir($publicDir, 0755, true);
            }
            $file->move($publicDir, $filename);

            // Root uploads folder fallback (base_path('uploads/avatars'))
            $rootDir = base_path('uploads/avatars');
            if (!file_exists($rootDir)) {
                @mkdir($rootDir, 0755, true);
            }
            @copy($publicDir . '/' . $filename, $rootDir . '/' . $filename);

            // Store relative path in database
            $validated['avatar'] = '/uploads/avatars/' . $filename;
        }

        $user = User::create($validated);

        ActivityLogger::log('CREATE_USER', 'users', $user->id, 'Création de l\'utilisateur ' . $user->email . ' avec photo');

        return response()->json(['success' => true, 'message' => 'Utilisateur créé avec succès', 'data' => $user], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Utilisateur introuvable'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:admin,exploitation,consultation',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'avatar' => 'nullable|string',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Handle uploaded real photo file from device
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Primary upload location (public/uploads/avatars)
            $publicDir = public_path('uploads/avatars');
            if (!file_exists($publicDir)) {
                @mkdir($publicDir, 0755, true);
            }
            $file->move($publicDir, $filename);

            // Root uploads folder fallback (base_path('uploads/avatars'))
            $rootDir = base_path('uploads/avatars');
            if (!file_exists($rootDir)) {
                @mkdir($rootDir, 0755, true);
            }
            @copy($publicDir . '/' . $filename, $rootDir . '/' . $filename);

            // Store relative path in database
            $validated['avatar'] = '/uploads/avatars/' . $filename;
        }

        $user->update($validated);

        ActivityLogger::log('UPDATE_USER', 'users', $user->id, 'Mise à jour de l\'utilisateur ' . $user->email);

        return response()->json(['success' => true, 'message' => 'Utilisateur mis à jour avec succès', 'data' => $user]);
    }

    public function destroy(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Utilisateur introuvable'], 404);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        $email = $user->email;
        $user->delete();

        ActivityLogger::log('DELETE_USER', 'users', $id, 'Suppression de l\'utilisateur ' . $email);

        return response()->json(['success' => true, 'message' => 'Utilisateur supprimé avec succès']);
    }
}
