'use client';

import { createContext, useContext } from 'react';

// Local Supabase auth types (package doesn't export directly)
export interface User {
  id: string;
  email?: string;
  app_metadata?: { role?: string; provider?: string; [key: string]: unknown };
  user_metadata?: { role?: string; [key: string]: unknown };
}

export interface Session {
  user: User | null;
  access_token?: string;
  expires_at?: number;
}

export interface AuthError {
  message: string;
}

export type AuthRole = 'admin' | 'editor' | 'user' | 'anonymous';
export type OAuthProvider = 'google';

export interface AuthContextType {
  user: User | null;
  role: AuthRole;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setRole: (role: AuthRole) => void;
  signInWithOAuth: (provider: OAuthProvider) => Promise<AuthError | null>;
  signInWithEmailPassword: (email: string, password: string, rememberMe?: boolean) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
  signUp: () => Promise<AuthError | null>;
  resetPassword: () => Promise<AuthError | null>;
  updateProfile: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
  checkSession: () => Promise<Session | null>;
  validateSession: () => Promise<boolean>;
  isInitialized: boolean;
  getRememberedEmail: () => string;
  isAuthenticated: boolean;
  csrfToken: string;
  csrfTimestamp: number;
  csrfSignature: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
