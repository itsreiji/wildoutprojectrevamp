import { createClient } from '@jsr/supabase__supabase-js';
import type { Database } from './types';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Error handling for missing environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create and export typed Supabase client
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Default export
export default supabaseClient;
