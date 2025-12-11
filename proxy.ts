import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // Add custom headers for security
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  // Content Security Policy - adjust based on your Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline' ${supabaseUrl}; style-src 'self' 'unsafe-inline'; img-src 'self' data: ${supabaseUrl}; font-src 'self'; connect-src 'self' ${supabaseUrl}; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';`,
  );

  // HTTP Strict Transport Security
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // XSS Protection
  response.headers.set('X-XSS-Protection', '0');

  // DNS Prefetch Control
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  // Permissions Policy
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

  // Allow requests to Supabase
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    // This endpoint is handled by our API route
  }

  return response;
}
