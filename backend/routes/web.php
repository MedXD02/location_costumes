<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CostumePdfController;

Route::get('/', function () {
    return response()->json([
        'message' => 'Costume Rental API',
        'version' => '1.0.0',
    ]);
});

Route::get('/costumes/pdf', [CostumePdfController::class, 'download']);


