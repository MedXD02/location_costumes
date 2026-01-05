<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Costume;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CostumeController extends Controller
{
    /**
     * Display a listing of costumes.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Costume::where('published', true);

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by size
        if ($request->has('size')) {
            $query->where('size', $request->size);
        }

        // Filter by availability
        if ($request->has('available')) {
            $query->where('availability', $request->boolean('available'));
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $costumes = $query->get()->map(function ($costume) {
            return [
                'id' => $costume->id,
                'name' => $costume->name,
                'description' => $costume->description,
                'category' => $costume->category,
                'size' => $costume->size,
                'price_per_day' => $costume->price_per_day,
                'availability' => $costume->isAvailable(),
                'image_url' => $costume->image_url,
                'whatsapp_link' => $costume->whatsapp_link,
                'available_from' => $costume->available_from,
                'available_until' => $costume->available_until,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $costumes,
        ]);
    }

    /**
     * Display the specified costume.
     */
    public function show($id): JsonResponse
    {
        $costume = Costume::where('published', true)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $costume->id,
                'name' => $costume->name,
                'description' => $costume->description,
                'category' => $costume->category,
                'size' => $costume->size,
                'price_per_day' => $costume->price_per_day,
                'availability' => $costume->isAvailable(),
                'image_url' => $costume->image_url,
                'whatsapp_link' => $costume->whatsapp_link,
                'available_from' => $costume->available_from,
                'available_until' => $costume->available_until,
                'availability_dates' => $costume->availability_dates,
            ],
        ]);
    }

    /**
     * Get available dates for a costume.
     */
    public function getAvailableDates(Request $request, $id): JsonResponse
    {
        $costume = Costume::where('published', true)->findOrFail($id);

        $startDate = $request->input('start_date', now()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->addMonths(3)->format('Y-m-d'));

        $availableDates = $costume->getAvailableDates($startDate, $endDate);
        
        // Générer toutes les dates dans la plage
        $allDates = [];
        $current = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);
        
        while ($current->lte($end)) {
            $dateStr = $current->format('Y-m-d');
            $allDates[] = $dateStr;
            $current->addDay();
        }
        
        // Séparer disponibles et non disponibles
        $unavailableDates = array_values(array_diff($allDates, $availableDates));

        return response()->json([
            'success' => true,
            'data' => [
                'available_dates' => array_values($availableDates),
                'unavailable_dates' => $unavailableDates,
                'costume_id' => $costume->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Get available categories.
     */
    public function categories(): JsonResponse
    {
        $categories = Costume::where('published', true)
            ->distinct()
            ->whereNotNull('category')
            ->pluck('category')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}

