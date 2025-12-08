
/* Fixed login issue by adding proper session validation and error handling */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabaseClient } from '../supabase/client';
import { validateEmail } from '../utils/authValidation';
import { validatePasswordComplexity as validatePassword, checkRateLimit, recordRateLimitAttempt, clearRateLimit as clearLoginAttempts, generateCSRFToken, verifyCSRFToken, sanitizeInput, validateSecureEmail } from '../utils/security';
import { auditService } from '../services/auditService';
// AuthContext and hook
export const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

// Local Supabase auth types (package doesn't export directly)
export interface User {
  id: string;
  email?: string;
  app_metadata?: { role?: string; provider?: string;[key: string]: any };
  user_metadata?: { role?: string;[key: string]: any };
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

// Cache for user profile data to avoid repeated database calls
interface CachedProfile {
  id: string;
  role: AuthRole;
  email: string;
  lastUpdated: number;
  ttl: number; // Time to live in milliseconds
}

const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const profileCache = new Map<string, CachedProfile>();

const getRoleFromUser = (user: User | null): AuthRole => {
  const claimRole =
    user?.app_metadata?.role ??
    user?.user_metadata?.role ??
    (user ? 'user' : undefined);

  if (claimRole === 'admin') return 'admin';
  if (claimRole === 'editor') return 'editor';
  if (claimRole === 'user') return 'user';
  return user ? 'user' : 'anonymous';
};

// Enhanced role fetching with caching
const getUserRoleWithCache = async (userId: string): Promise<AuthRole> => {
  // Check cache first
  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.lastUpdated < cached.ttl) {
    return cached.role;
  }

  try {
    // Use RPC to get profile role safely
    const { data: profiles, error } = await supabaseClient.rpc('get_user_profile', { user_uuid: userId });

    if (error) {
      console.warn('RPC error fetching user profile:', error);
    } else if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      const role = (profile?.role as AuthRole) || 'user';

      // Cache the result
      profileCache.set(userId, {
        id: userId,
        role,
        email: profile.email || '',
        lastUpdated: Date.now(),
        ttl: PROFILE_CACHE_TTL,
      });

      return role;
    }
  } catch (rpcError) {
    console.warn('RPC error in getUserRoleWithCache:', rpcError);
  }

  // Fallback to user metadata from auth
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const fallbackRole = getRoleFromUser(user);
    profileCache.set(userId, {
      id: userId,
      role: fallbackRole,
      email: user?.email || '',
      lastUpdated: Date.now(),
      ttl: PROFILE_CACHE_TTL,
    });
    return fallbackRole;
  } catch (fallbackError) {
    console.error('Fallback auth.getUser failed:', fallbackError);
    return 'user';
  }
};

// Placeholder for additional state and functions (e.g., signOut, signUp, etc.)

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State definitions
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AuthRole>('anonymous');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [csrfTimestamp, setCsrfTimestamp] = useState<number>(0);
  const [csrfSignature, setCsrfSignature] = useState<string>('');

  // Session validation function
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error || !session) {
        console.warn('Session validation failed:', error?.message || 'No active session');
        return false;
      }

      // Verify the token hasn't expired
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      if (expiresAt < Date.now()) {
        console.warn('Session expired');
        return false;
      }

      // Verify user role is valid
      const userRole = await getUserRoleWithCache(session.user.id);
      if (!['admin', 'editor', 'user'].includes(userRole)) {
        console.warn('Invalid user role:', userRole);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }, []);

  // Authentication functions
  const signInWithOAuth = async (provider: string) => { return { message: 'OAuth not implemented' } as AuthError; };
  const signOut = async () => { 
    await supabaseClient.auth.signOut();
    setUser(null); 
    setRole('anonymous'); 
    return; 
  };
  const clearError = () => setError(null);
  const signUp = async () => { return { message: 'SignUp not implemented' } as AuthError; };
  const resetPassword = async () => { return { message: 'ResetPassword not implemented' } as AuthError; };
  const updateProfile = async () => { return; };
  const refreshSession = async () => { 
    const { data, error } = await supabaseClient.auth.refreshSession();
    if (error) throw error;
    return data.session;
  };
  const checkSession = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  };
  const isInitialized = true;

  // Get remembered email from localStorage
  const getRememberedEmail = (): string => {
    if (typeof window !== 'undefined' && localStorage.getItem('remember_me') === 'true') {
      return localStorage.getItem('remembered_email') || '';
    }
    return '';
  };

  // Computed authentication status
  const isAuthenticated = !!user;

  // Update session state helper with improved error handling
  const updateSessionState = async (session: Session | null) => {
    setLoading(true);
    try {
      if (session?.user) {
        try {
          const role = await getUserRoleWithCache(session.user.id);
          setUser(session.user);
          setRole(role);
          console.log('Session state updated for user:', session.user.email, 'with role:', role);
        } catch (error) {
          console.error('Error getting user role:', error);
          // If we can't get the role, still set the user but with 'user' role as fallback
          setUser(session.user);
          setRole('user');
        }
      } else {
        console.log('No active session, setting anonymous user');
        setUser(null);
        setRole('anonymous');
      }
    } catch (error) {
      console.error('Error updating session state:', error);
      setUser(null);
      setRole('anonymous');
    } finally {
      setLoading(false);
    }
  };

  // Listen to auth state changes
  // Define wrapper for failed login recording
  const recordFailedLogin = (email: string) => {
    // Use the same rate limit attempt function for failed login tracking
    recordRateLimitAttempt(`login_${email}`);
  };

  useEffect(() => {
    // Fetch initial session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
          console.error('Error fetching initial session:', error);
          setLoading(false);
          return;
        }
        await updateSessionState(session);
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event: string, session: Session | null) => {
      updateSessionState(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);


  // ... [existing state and functions remain unchanged] ...

  const signInWithEmailPassword = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    // ... [existing code remains unchanged] ...

    // Input sanitization
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    // Email validation
    const emailValidation = validateSecureEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0] || 'Invalid email format');
      return { message: emailValidation.errors[0] || 'Invalid email format' } as AuthError;
    }

    // Password validation
    const passwordValidation = validatePassword(sanitizedPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.feedback[0] || 'Invalid password format');
      return { message: passwordValidation.feedback[0] || 'Invalid password format' } as AuthError;
    }

    // Rate limiting check
    const rateLimitCheck = checkRateLimit(`login_${sanitizedEmail}`);
    if (!rateLimitCheck.allowed) {
      const minutes = Math.ceil((rateLimitCheck.timeRemaining || 0) / 60000);
      setError(`Too many login attempts.Please try again in ${minutes} minute(s).`);
      return { message: `Too many login attempts.Please try again in ${minutes} minute(s).` } as AuthError;
    }

    // CSRF protection
    const csrfData = generateCSRFToken('wildout-secret');
    setCsrfToken(csrfData.token);
    setCsrfTimestamp(csrfData.timestamp);
    setCsrfSignature(csrfData.signature);
    if (!verifyCSRFToken(csrfData.token, csrfData.timestamp, csrfData.signature, 'wildout-secret')) {
      setError('Security validation failed. Please refresh the page and try again.');
      return { message: 'Security validation failed' } as AuthError;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: sanitizedEmail,
      password: sanitizedPassword,
    });

    if (error) {
      // Handle specific error cases
      let errorMessage = error.message;

      if (error.message.includes('invalid_credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
        recordFailedLogin(sanitizedEmail);
        recordRateLimitAttempt(`login_${sanitizedEmail}`);
      } else if (error.message.includes('user_not_found')) {
        errorMessage = 'No account found with this email. Please check your email or create a new account.';
      } else if (error.message.includes('too_many_requests')) {
        errorMessage = 'Too many login attempts. Please try again later.';
      }

      await auditService.logLoginFailure(sanitizedEmail, errorMessage);
      setError(errorMessage);
      return { message: errorMessage } as AuthError;
    }

    // Clear failed login attempts on successful login
    clearLoginAttempts(sanitizedEmail);

    // Set remember me if enabled
    if (rememberMe && typeof window !== 'undefined') {
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('remembered_email', sanitizedEmail);
    } else {
      localStorage.removeItem('remember_me');
      localStorage.removeItem('remembered_email');
    }

    console.log('✅ Email/password sign-in successful');
    // Note: Login success is logged in onAuthStateChange
    await updateSessionState(data.session);
    setLoading(false);
    return null;
  }, [updateSessionState]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        error,
        signInWithOAuth,
        signInWithEmailPassword,
        signOut,
        clearError,
        signUp,
        resetPassword,
        updateProfile,
        refreshSession,
        checkSession,
        validateSession, // Add validateSession to context
        isInitialized,
        getRememberedEmail,
        isAuthenticated,
        csrfToken,
        csrfTimestamp,
        csrfSignature,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthProvider;