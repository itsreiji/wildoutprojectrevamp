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

// Session ID storage key for cross-page consistency
const SESSION_ID_KEY = 'wildout_session_id';

// Enhanced storage with session ID tracking
const createEnhancedStorage = () => ({
  getItem: (key: string) => {
    try {
      if (typeof window === 'undefined') return null;
      const value = localStorage.getItem(key);

      // Special handling for session data to track session ID
      if (key === 'sb-' + supabaseUrl.split('//')[1] + '-auth-token' && value) {
        const parsed = JSON.parse(value);
        if (parsed?.access_token) {
          localStorage.setItem(SESSION_ID_KEY, parsed.access_token);
        }
      }

      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Failed to get item from localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, value);

      // Track session ID changes for cross-page consistency
      if (key === 'sb-' + supabaseUrl.split('//')[1] + '-auth-token') {
        const parsed = JSON.parse(value);
        if (parsed?.access_token) {
          localStorage.setItem(SESSION_ID_KEY, parsed.access_token);
        }
      }
    } catch (error) {
      console.warn('Failed to set item in localStorage:', error);
    }
  },
  removeItem: (key: string) => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);

      // Clear session ID when auth token is removed
      if (key === 'sb-' + supabaseUrl.split('//')[1] + '-auth-token') {
        localStorage.removeItem(SESSION_ID_KEY);
      }
    } catch (error) {
      console.warn('Failed to remove item from localStorage:', error);
    }
  },
});

// Supabase client configuration with optimized cookie and session management
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatic session persistence and refresh
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Enhanced storage with session ID tracking
    storage: createEnhancedStorage(),
    // Enhanced flow type for better UX
    flowType: 'pkce',
  },
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'wildout-project',
    },
  },
});

// Utility function to get stored session ID
export const getStoredSessionId = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_ID_KEY);
  } catch (error) {
    console.warn('Failed to get stored session ID:', error);
    return null;
  }
};

// Utility function to clear stored session ID
export const clearStoredSessionId = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.warn('Failed to clear stored session ID:', error);
  }
};

// Default export
export default supabaseClient;
