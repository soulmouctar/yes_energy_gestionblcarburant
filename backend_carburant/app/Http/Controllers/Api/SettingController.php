<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get all active system settings stored in database.
     */
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'color_scheme' => $settings['color_scheme'] ?? 'red',
                'theme' => $settings['theme'] ?? 'dark',
            ]
        ]);
    }

    /**
     * Update system settings in MySQL database so it reflects globally for all users.
     */
    public function update(Request $request)
    {
        $request->validate([
            'color_scheme' => 'nullable|string|in:red,blue,amber',
            'theme' => 'nullable|string|in:dark,light',
        ]);

        if ($request->has('color_scheme')) {
            Setting::updateOrCreate(
                ['key' => 'color_scheme'],
                ['value' => $request->color_scheme]
            );
        }

        if ($request->has('theme')) {
            Setting::updateOrCreate(
                ['key' => 'theme'],
                ['value' => $request->theme]
            );
        }

        $settings = Setting::all()->pluck('value', 'key')->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Paramètres du système enregistrés en base de données et appliqués à tous les utilisateurs.',
            'data' => [
                'color_scheme' => $settings['color_scheme'] ?? 'red',
                'theme' => $settings['theme'] ?? 'dark',
            ]
        ]);
    }
}
