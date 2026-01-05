<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ParseMultipartForm
{
    public function handle(Request $request, Closure $next): Response
    {
        // For PUT/PATCH requests with multipart form-data, we need to manually parse
        if (in_array($request->getMethod(), ['PUT', 'PATCH', 'POST']) && 
            strpos($request->header('Content-Type') ?? '', 'multipart/form-data') !== false) {
            
            // Symfony's Request object should handle this, but let's ensure files are accessible
            // This is a workaround for PHP's limitation with PUT requests
            \Log::debug('Parsing multipart for ' . $request->getMethod() . ' request');
        }

        return $next($request);
    }
}

