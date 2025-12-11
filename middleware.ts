import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Add custom headers for security
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Allow requests to Supabase
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    // This endpoint is handled by our API route
  }

  return response;
}


