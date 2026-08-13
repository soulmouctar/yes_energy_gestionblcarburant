<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return response()->json([
        'app' => 'GESTION BL - YES ENERGY API',
        'status' => 'online',
    ]);
});

/**
 * Universal Image / Asset Serving Route
 * Solves upload directory path mismatches whether 'uploads' is placed inside 'public/uploads'
 * or at the root of the project ('backend_carburant/uploads').
 */
Route::get('/uploads/{path}', function ($path) {
    // 1. Check in public_path ('public/uploads/...')
    $publicFilePath = public_path('uploads/' . $path);
    if (file_exists($publicFilePath) && !is_dir($publicFilePath)) {
        return Response::file($publicFilePath);
    }

    // 2. Fallback: Check in base_path ('uploads/...' at project root)
    $rootFilePath = base_path('uploads/' . $path);
    if (file_exists($rootFilePath) && !is_dir($rootFilePath)) {
        return Response::file($rootFilePath);
    }

    // 3. Fallback: Check in storage_path ('storage/app/public/uploads/...')
    $storageFilePath = storage_path('app/public/uploads/' . $path);
    if (file_exists($storageFilePath) && !is_dir($storageFilePath)) {
        return Response::file($storageFilePath);
    }

    abort(404);
})->where('path', '.*');
