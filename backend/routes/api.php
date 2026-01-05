<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CostumeController;
use App\Http\Controllers\Api\RentalController;
use App\Http\Controllers\Api\AdminCostumeController;
use App\Http\Controllers\Api\AdminRentalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public routes
    Route::get('/costumes', [CostumeController::class, 'index']);
    Route::get('/costumes/categories', [CostumeController::class, 'categories']);
    Route::get('/costumes/{id}', [CostumeController::class, 'show']);
    Route::get('/costumes/{id}/available-dates', [CostumeController::class, 'getAvailableDates']);

    // Authentication routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // User routes
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Rentals routes (clients)
        Route::get('/rentals', [RentalController::class, 'index']);
        Route::post('/rentals', [RentalController::class, 'store']);
        Route::get('/rentals/{id}', [RentalController::class, 'show']);
        Route::patch('/rentals/{id}/cancel', [RentalController::class, 'cancel']);

        // Admin routes
        Route::prefix('admin')->group(function () {
            // Admin costumes
            Route::get('/costumes', [AdminCostumeController::class, 'index']);
            Route::post('/costumes', [AdminCostumeController::class, 'store']);
            Route::post('/costumes/{id}', [AdminCostumeController::class, 'update']);
            Route::put('/costumes/{id}', [AdminCostumeController::class, 'update']);
            Route::delete('/costumes/{id}', [AdminCostumeController::class, 'destroy']);
            Route::patch('/costumes/{id}/toggle-publish', [AdminCostumeController::class, 'togglePublish']);

            // Admin rentals
            Route::get('/rentals', [AdminRentalController::class, 'index']);
            Route::get('/rentals/{id}', [AdminRentalController::class, 'show']);
            Route::patch('/rentals/{id}/status', [AdminRentalController::class, 'updateStatus']);
        });
    });
});


