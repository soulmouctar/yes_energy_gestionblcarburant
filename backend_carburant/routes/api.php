<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\BlController;
use App\Http\Controllers\Api\CamionController;
use App\Http\Controllers\Api\ChauffeurController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\TransporteurController;
use App\Http\Controllers\Api\LiquidationController;
use App\Http\Controllers\Api\RapportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\SettingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes (Auth & System Settings)
Route::post('/login', [AuthController::class, 'login']);
Route::get('/settings', [SettingController::class, 'index']);
Route::post('/settings', [SettingController::class, 'update']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {

    // User & Profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/update-password', [AuthController::class, 'updatePassword']);
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);

    // Dashboard Stats & Charts
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Bons de Livraison (BL)
    Route::get('/bl/generate-number', [BlController::class, 'generateNumber']);
    Route::post('/bl/{id}/duplicate', [BlController::class, 'duplicate']);
    Route::apiResource('bl', BlController::class);

    // Referentials
    Route::apiResource('camions', CamionController::class);
    Route::apiResource('chauffeurs', ChauffeurController::class);
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('destinations', DestinationController::class);
    Route::apiResource('transporteurs', TransporteurController::class);

    // Liquidations
    Route::get('/liquidations', [LiquidationController::class, 'index']);
    Route::post('/liquidations/{id}', [LiquidationController::class, 'liquider']);
    Route::post('/liquidations-bulk', [LiquidationController::class, 'bulkLiquider']);

    // Reports & Analytics
    Route::get('/rapports', [RapportController::class, 'generate']);

    // Admin Users & Activity Audit Logs
    Route::apiResource('users', UserController::class);
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);

});
