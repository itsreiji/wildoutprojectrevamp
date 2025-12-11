import { NextRequest, NextResponse } from 'next/server';

// This API route acts as a proxy for Supabase auth requests
// It's important for handling sensitive operations server-side
export async function GET(request: NextRequest) {
  // For GET requests, we'll redirect to the Supabase auth provider
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  if (provider) {
    // Get the Supabase URL from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    // Construct the redirect URL to Supabase OAuth provider
    const redirectTo = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${request.nextUrl.origin}/auth/callback`;

    return NextResponse.redirect(redirectTo);
  }

  return NextResponse.json({ error: 'Provider not specified' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    // Get the Supabase URL and API key from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { action, ...payload } = body;

    // Map the action to the appropriate Supabase endpoint
    let supabaseEndpoint: string;
    switch (action) {
      case 'signin':
        supabaseEndpoint = `${supabaseUrl}/auth/v1/token?grant_type=password`;
        break;
      case 'signup':
        supabaseEndpoint = `${supabaseUrl}/auth/v1/signup`;
        break;
      case 'signout':
        supabaseEndpoint = `${supabaseUrl}/auth/v1/logout`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Forward the request to Supabase
    const response = await fetch(supabaseEndpoint, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Return the response from Supabase
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}