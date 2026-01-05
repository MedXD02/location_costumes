<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Costume extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'size',
        'price_per_day',
        'availability',
        'image_url',
        'whatsapp_link',
        'image_path',
        'admin_id',
        'published',
        'availability_dates',
        'available_from',
        'available_until',
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
        'availability' => 'boolean',
        'published' => 'boolean',
        'availability_dates' => 'array',
        'available_from' => 'date',
        'available_until' => 'date',
    ];

    /**
     * Get the rentals for this costume.
     */
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    /**
     * Get the admin who created this costume.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Check if costume is available for rental on a specific date.
     */
    public function isAvailableOnDate($date): bool
    {
        if (!$this->published || !$this->availability) {
            return false;
        }

        $checkDate = \Carbon\Carbon::parse($date);

        // Check if date is within available range
        if ($this->available_from && $checkDate->lt($this->available_from)) {
            return false;
        }

        if ($this->available_until && $checkDate->gt($this->available_until)) {
            return false;
        }

        // Check if date is in availability_dates array
        if ($this->availability_dates && !in_array($date, $this->availability_dates)) {
            return false;
        }

        // Check if date is not already rented
        $rented = $this->rentals()
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('start_date', '<=', $checkDate)
            ->where('end_date', '>=', $checkDate)
            ->exists();

        return !$rented;
    }

    /**
     * Check if costume is available for rental (legacy method).
     */
    public function isAvailable(): bool
    {
        return $this->published && $this->availability;
    }

    /**
     * Get available dates in a range.
     */
    public function getAvailableDates($startDate, $endDate): array
    {
        $available = [];
        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);

        while ($start->lte($end)) {
            if ($this->isAvailableOnDate($start->format('Y-m-d'))) {
                $available[] = $start->format('Y-m-d');
            }
            $start->addDay();
        }

        return $available;
    }

    /**
     * Return a public URL for the image.
     */
    public function getImageUrlAttribute($value)
    {
        // If an uploaded image path exists (stored on public disk), return its URL
        if ($this->image_path) {
            return \Illuminate\Support\Facades\Storage::disk('public')->url($this->image_path);
        }

        // Otherwise fall back to stored `image_url` value
        return $value;
    }
}

