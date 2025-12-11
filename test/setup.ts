// Basic test setup for Vitest
// This file is automatically loaded before tests run

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_KEY = 'test-service-key';

// Mock window object for browser-like environment
if (typeof window === 'undefined') {
  global.window = {
    location: {
      href: 'http://localhost',
      origin: 'http://localhost',
    },
  } as any;
}