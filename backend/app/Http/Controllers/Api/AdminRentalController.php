<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminRentalController extends Controller
{
    /**
     * Create a new constructor to add auth middleware.
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Display all rentals for admin's costumes.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $rentals = Rental::with(['costume', 'user'])
            ->whereHas('costume', function ($query) use ($user) {
                $query->where('admin_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rental) {
                return [
                    'id' => $rental->id,
                    'costume' => [
                        'id' => $rental->costume->id,
                        'name' => $rental->costume->name,
                        'image_url' => $rental->costume->image_url,
                    ],
                    'user' => [
                        'id' => $rental->user->id,
                        'name' => $rental->user->name,
                        'email' => $rental->user->email,
                    ],
                    'start_date' => $rental->start_date->format('Y-m-d'),
                    'end_date' => $rental->end_date->format('Y-m-d'),
                    'total_price' => $rental->total_price,
                    'status' => $rental->status,
                    'notes' => $rental->notes,
                    'created_at' => $rental->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $rentals,
        ]);
    }

    /**
     * Update rental status.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $rental = Rental::with('costume')
            ->whereHas('costume', function ($query) use ($user) {
                $query->where('admin_id', $user->id);
            })
            ->findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,confirmed,rejected,cancelled,completed',
        ]);

        $rental->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Rental status updated successfully',
            'data' => [
                'id' => $rental->id,
                'status' => $rental->status,
            ],
        ]);
    }

    /**
     * Show rental details.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $rental = Rental::with(['costume', 'user'])
            ->whereHas('costume', function ($query) use ($user) {
                $query->where('admin_id', $user->id);
            })
            ->findOrFail($id);

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
                'user' => [
                    'id' => $rental->user->id,
                    'name' => $rental->user->name,
                    'email' => $rental->user->email,
                ],
                'start_date' => $rental->start_date->format('Y-m-d'),
                'end_date' => $rental->end_date->format('Y-m-d'),
                'total_price' => $rental->total_price,
                'status' => $rental->status,
                'notes' => $rental->notes,
                'created_at' => $rental->created_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}


