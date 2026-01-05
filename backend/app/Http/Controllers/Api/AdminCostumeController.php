<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Costume;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminCostumeController extends Controller
{
    /**
     * Create a new constructor to add auth middleware.
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Display a listing of admin's costumes.
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

        $costumes = Costume::where('admin_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $costumes,
        ]);
    }

    /**
     * Store a newly created costume.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:50',
            'price_per_day' => 'required|numeric|min:0',
            'image_url' => 'nullable|url',
            'whatsapp_link' => 'nullable|string|max:2048',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:5120',
            'availability_dates' => 'nullable|array',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'size' => $request->size,
            'price_per_day' => $request->price_per_day,
            'image_url' => $request->image_url,
            'whatsapp_link' => $request->whatsapp_link,
            'admin_id' => $user->id,
            'availability' => true,
            'published' => $request->published ?? false,
            'availability_dates' => $request->availability_dates,
            'available_from' => $request->available_from,
            'available_until' => $request->available_until,
        ];

        // Handle uploaded image file (multipart/form-data)
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('costumes', 'public');
            $data['image_path'] = $path;
        }

        $costume = Costume::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Costume created successfully',
            'data' => $costume,
        ], 201);
    }

    /**
     * Update the specified costume.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $costume = Costume::where('admin_id', $user->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:50',
            'price_per_day' => 'sometimes|required|numeric|min:0',
            'image_url' => 'nullable|url',
            'whatsapp_link' => 'nullable|string|max:2048',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:5120',
            'availability' => 'sometimes|boolean',
            'published' => 'sometimes|boolean',
            'availability_dates' => 'nullable|array',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $updateData = $request->only([
            'name',
            'description',
            'category',
            'size',
            'price_per_day',
            'image_url',
            'whatsapp_link',
            'availability',
            'published',
            'availability_dates',
            'available_from',
            'available_until',
        ]);

        // Handle uploaded image - PHP natively parses multipart for POST requests
        if ($request->hasFile('image')) {
            // Delete old image if present
            if ($costume->image_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($costume->image_path);
            }
            $path = $request->file('image')->store('costumes', 'public');
            $updateData['image_path'] = $path;
            \Log::info('Image uploaded successfully', ['path' => $path]);
        }

        $costume->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Costume updated successfully',
            'data' => $costume,
        ]);
    }

    /**
     * Remove the specified costume.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $costume = Costume::where('admin_id', $user->id)->findOrFail($id);
        $costume->delete();

        return response()->json([
            'success' => true,
            'message' => 'Costume deleted successfully',
        ]);
    }

    /**
     * Toggle publish status.
     */
    public function togglePublish(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $costume = Costume::where('admin_id', $user->id)->findOrFail($id);
        $costume->update(['published' => !$costume->published]);

        return response()->json([
            'success' => true,
            'message' => 'Costume ' . ($costume->published ? 'published' : 'unpublished') . ' successfully',
            'data' => $costume,
        ]);
    }
}


