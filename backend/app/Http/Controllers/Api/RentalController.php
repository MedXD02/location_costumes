<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use App\Models\Costume;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class RentalController extends Controller
{
    /**
     * Display a listing of rentals.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $query = Rental::with(['costume', 'user']);
        
        // Si un utilisateur est authentifié, ne montrer que ses réservations
        if ($user) {
            $query->where('user_id', $user->id);
        } elseif ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }
        
        $rentals = $query->get()
            ->map(function ($rental) {
                return [
                    'id' => $rental->id,
                    'costume' => [
                        'id' => $rental->costume->id,
                        'name' => $rental->costume->name,
                        'image_url' => $rental->costume->image_url,
                    ],
                    'start_date' => $rental->start_date->format('Y-m-d'),
                    'end_date' => $rental->end_date->format('Y-m-d'),
                    'total_price' => $rental->total_price,
                    'status' => $rental->status,
                    'notes' => $rental->notes,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $rentals,
        ]);
    }

    /**
     * Store a newly created rental.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'costume_id' => 'required|integer|exists:costumes,id',
            'start_date' => 'required|date|date_format:Y-m-d|after_or_equal:today',
            'end_date' => 'required|date|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $costume = Costume::where('published', true)->findOrFail($request->costume_id);

        // Check availability for each date in the range
        $startDate = \Carbon\Carbon::parse($request->start_date);
        $endDate = \Carbon\Carbon::parse($request->end_date);
        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            if (!$costume->isAvailableOnDate($currentDate->format('Y-m-d'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Costume is not available on ' . $currentDate->format('Y-m-d'),
                ], 400);
            }
            $currentDate->addDay();
        }

        // Check if costume is already rented for the selected period
        $existingRental = Rental::where('costume_id', $request->costume_id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                    ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_date', '<=', $request->start_date)
                          ->where('end_date', '>=', $request->end_date);
                    });
            })
            ->exists();

        if ($existingRental) {
            return response()->json([
                'success' => false,
                'message' => 'Costume is already rented for the selected period',
            ], 400);
        }

        $startDate = \Carbon\Carbon::parse($request->start_date);
        $endDate = \Carbon\Carbon::parse($request->end_date);
        $days = $startDate->diffInDays($endDate) + 1;
        $totalPrice = $costume->price_per_day * $days;

        $rental = Rental::create([
            'user_id' => Auth::id() ?? $request->user_id ?? 1,
            'costume_id' => $request->costume_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'total_price' => $totalPrice,
            'status' => 'pending',
            'notes' => $request->notes ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rental created successfully',
            'data' => [
                'id' => $rental->id,
                'costume' => [
                    'id' => $costume->id,
                    'name' => $costume->name,
                ],
                'start_date' => $rental->start_date->format('Y-m-d'),
                'end_date' => $rental->end_date->format('Y-m-d'),
                'total_price' => $rental->total_price,
                'status' => $rental->status,
            ],
        ], 201);
    }

    /**
     * Display the specified rental.
     */
    public function show($id): JsonResponse
    {
        $rental = Rental::with(['costume', 'user'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $rental->id,
                'costume' => [
                    'id' => $rental->costume->id,
                    'name' => $rental->costume->name,
                    'description' => $rental->costume->description,
                    'image_url' => $rental->costume->image_url,
                ],
                'start_date' => $rental->start_date->format('Y-m-d'),
                'end_date' => $rental->end_date->format('Y-m-d'),
                'total_price' => $rental->total_price,
                'status' => $rental->status,
            ],
        ]);
    }

    /**
     * Cancel a rental.
     */
    public function cancel($id): JsonResponse
    {
        $rental = Rental::findOrFail($id);

        if ($rental->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Rental is already cancelled',
            ], 400);
        }

        $rental->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Rental cancelled successfully',
        ]);
    }
}

