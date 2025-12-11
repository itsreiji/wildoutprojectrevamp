// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle error case
  if (error) {
    // Redirect to login page with error
    const errorDescription = searchParams.get('error_description');
    const redirectUrl = `/login?error=${error}&error_description=${encodeURIComponent(errorDescription || '')}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Handle success case (authorization code received)
  if (code) {
    try {
      // Get Supabase URL and API key from environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration');
      }

      // Exchange the authorization code for a session
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=authorization_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          code,
          redirect_uri: `${request.nextUrl.origin}/api/auth/callback`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        // Set the session in a cookie (or handle it as needed)
        // Note: In a real app, you should handle sessions more securely
        // This is just a simplified example
        cookies().set('sb-access-token', data.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: data.expires_in,
          path: '/',
        });

        if (data.refresh_token) {
          cookies().set('sb-refresh-token', data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1209600, // 2 weeks
            path: '/',
          });
        }

        // Redirect to dashboard or home page after successful login
        return NextResponse.redirect(new URL('/sadmin', request.url));
      } else {
        // Handle token exchange failure
        console.error('Token exchange failed:', data);
        return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
      }
    } catch (err) {
      console.error('Error during auth callback:', err);
      return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
    }
  }

  // If neither error nor code is present, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}