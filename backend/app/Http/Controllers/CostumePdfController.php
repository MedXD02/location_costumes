<?php

namespace App\Http\Controllers;

use App\Models\Costume;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class CostumePdfController extends Controller
{
    /**
     * Generate and download a PDF of available costumes and prices.
     */
    public function download(Request $request)
    {
        $costumes = Costume::where('published', true)
            ->where('availability', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return Pdf::loadView('costumes.pdf', compact('costumes'))
            ->setPaper('a4')
            ->download('costumes_available.pdf');
    }
}
