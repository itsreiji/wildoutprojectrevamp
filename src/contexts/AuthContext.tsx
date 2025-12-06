import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabaseClient } from '../supabase/client';
// Local Supabase auth types (package doesn't export directly)
export interface User {
  id: string;
  email?: string;
  app_metadata?: { role?: string };
  user_metadata?: { role?: string };
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

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  sessionId: string | null;
  role: AuthRole;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  lastActivity: number;
  signInWithOAuth: (provider: OAuthProvider) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearCache: () => void;
  validateSession: () => Promise<boolean>;
  checkSecurityStatus: () => Promise<{ isSecure: boolean; issues?: string[] }>;
  useDummyData: boolean;
  setUseDummyData: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [role, setRole] = useState<AuthRole>('anonymous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [useDummyData, setUseDummyData] = useState<boolean>(false);

  // Memoized authentication state
  const isAuthenticated = useMemo(() => !!user && !!session, [user, session]);

  // Synchronous session state update for immediate UI updates
  const updateSessionStateSync = useCallback((incomingSession: Session | null) => {
    const incomingUser = incomingSession?.user ?? null;
    setSession(incomingSession);
    setUser(incomingUser);

    // Only update sessionId if we have a valid session and token
    // Don't overwrite with null if we already have a valid sessionId
    if (incomingSession?.access_token) {
      setSessionId(incomingSession.access_token);
    } else if (!incomingSession) {
      // Only clear sessionId if session is explicitly null
      setSessionId(null);
    }

    setLastActivity(Date.now());

    // For synchronous updates, set role to anonymous initially
    // This will be updated asynchronously to the correct role
    if (incomingUser) {
      // Start with 'user' role, will be updated to correct role asynchronously
      setRole('user');
    } else {
      setRole('anonymous');
    }
  }, []);

  // Enhanced session state update with role caching and session ID tracking
  const updateSessionState = useCallback(async (incomingSession: Session | null) => {
    const incomingUser = incomingSession?.user ?? null;

    // First do the synchronous update
    updateSessionStateSync(incomingSession);

    // Then do async role fetching if user is authenticated
    if (incomingUser) {
      try {
        const userRole = await getUserRoleWithCache(incomingUser.id);
        setRole(userRole);
        console.log('✅ User role updated:', userRole);
      } catch (roleError) {
        console.warn('Failed to fetch user role, keeping existing role:', roleError);
        // Keep the role that was set synchronously
      }
    }
  }, [updateSessionStateSync]);

  // Clear cache utility
  const clearCache = useCallback(() => {
    profileCache.clear();
  }, []);

  // Session validation function for cross-page consistency using database sessions
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 Validating session...');

      if (!session || !user) {
        console.log('❌ No active session to validate');
        return false;
      }

      // First check if session is expired locally
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        console.log('❌ Session expired locally, attempting refresh...');
        // Try to refresh the session before invalidating
        try {
          const { data: refreshData, error: refreshError } = await supabaseClient.auth.refreshSession();
          if (refreshError || !refreshData.session) {
            console.log('❌ Session refresh failed');
            updateSessionStateSync(null);
            return false;
          }
          // Update with refreshed session
          await updateSessionState(refreshData.session);
          return true;
        } catch (refreshErr) {
          console.error('❌ Session refresh error:', refreshErr);
          updateSessionStateSync(null);
          return false;
        }
      }

      // Validate session with Supabase auth
      const { data, error } = await supabaseClient.auth.getSession();

      if (error) {
        console.error('❌ Session validation error:', error);
        updateSessionStateSync(null);
        return false;
      }

      if (!data.session) {
        console.log('❌ No valid session returned from Supabase');
        updateSessionStateSync(null);
        return false;
      }

      // Use current session's access_token for validation
      const currentToken = data.session.access_token;

      // Validate session in database (non-blocking)
      try {
        const { data: isValidSession, error: sessionError } = await supabaseClient.rpc('validate_user_session', {
          session_token_param: currentToken
        });

        if (sessionError) {
          console.warn('⚠️ Database session validation error:', sessionError);
          // Continue with Supabase validation if database check fails
        } else if (!isValidSession) {
          console.log('❌ Session invalidated in database');
          updateSessionStateSync(null);
          return false;
        } else {
          console.log('✅ Session validated in database');
        }
      } catch (dbError) {
        console.warn('⚠️ Database session check failed:', dbError);
        // Continue with Supabase validation - don't fail if DB check fails
      }

      // Ensure session ID consistency across pages
      // Update if token changed (e.g., after refresh)
      if (currentToken !== sessionId) {
        console.log('🔄 Session token updated, refreshing state');
        await updateSessionState(data.session);
      }

      console.log('✅ Session validation complete');
      return true;
    } catch (validationError) {
      console.error('❌ Session validation failed:', validationError);
      updateSessionStateSync(null);
      return false;
    }
  }, [session, user, sessionId, updateSessionStateSync, updateSessionState]);

  // Session refresh function
  const refreshSession = useCallback(async () => {
    try {
      setError(null);
      const { data, error } = await supabaseClient.auth.refreshSession();

      if (error) {
        console.warn('Session refresh failed:', error);
        setError('Failed to refresh session');
        return;
      }

      if (data.session) {
        await updateSessionState(data.session);
      }
    } catch (refreshError) {
      console.error('Session refresh error:', refreshError);
      setError('Session refresh failed');
    }
  }, [updateSessionState]);

  // Activity tracking for session management
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Simplified session refresh - only refresh when actually needed
  useEffect(() => {
    if (!isAuthenticated || !session?.expires_at) return;

    const checkSessionExpiry = () => {
      if (!session?.expires_at) return;
      const expiresAt = session.expires_at * 1000;
      const timeUntilExpiry = expiresAt - Date.now();

      // Only refresh if expiring within 2 minutes
      if (timeUntilExpiry < 2 * 60 * 1000) {
        console.log('Session expiring soon, refreshing...');
        refreshSession();
      }
    };

    const interval = setInterval(checkSessionExpiry, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, session, refreshSession]);

  // Page visibility change handler for session updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Simple session check without complex validation
        supabaseClient.auth.getSession().then(({ data, error }: { data: { session: Session | null }, error: any }) => {
          if (!error && data.session && data.session.access_token !== sessionId) {
            console.log('🔄 Session updated on page visibility change');
            updateSessionStateSync(data.session);
          }
        }).catch((err: any) => {
          console.warn('Failed to check session on visibility change:', err);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionId, updateSessionStateSync]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        console.log('🔄 Initializing auth state...');
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabaseClient.auth.getSession();

        if (sessionError) {
          console.warn('Session retrieval error:', sessionError);
          if (isMounted) {
            setError('Unable to read authentication state');
          }
        } else if (isMounted) {
          updateSessionStateSync(initialSession);
          // If there's a session, also do async role fetching
          if (initialSession?.user) {
            getUserRoleWithCache(initialSession.user.id).then(userRole => {
              if (isMounted) {
                setRole(userRole);
              }
            }).catch(roleError => {
              console.warn('Failed to fetch initial user role:', roleError);
            });
          }
          console.log('✅ Auth state initialized');
        }
      } catch (getSessionError) {
        console.error('Auth initialization failed:', getSessionError);
        if (isMounted) {
          setError('Unable to read authentication state');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event: string, nextSession: Session | null) => {
      console.log('🔄 Auth state change:', event, nextSession ? 'authenticated' : 'unauthenticated');

      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Session token refreshed');
        // When token refreshes, update the session record in database
        if (nextSession?.access_token) {
          // Try to validate/update the session in database
          supabaseClient.rpc('validate_user_session', {
            session_token_param: nextSession.access_token
          }).catch((err: unknown) => {
            console.warn('⚠️ Failed to update session on token refresh:', err);
            // If validation fails, try to create a new session record
            supabaseClient.rpc('create_user_session', {
              session_token: nextSession.access_token,
              expiry_hours: 24
            }).catch((createErr: unknown) => {
              // Ignore duplicate key errors (session already exists)
              if (!String(createErr).includes('duplicate') && !String(createErr).includes('unique')) {
                console.warn('⚠️ Failed to create session on token refresh:', createErr);
              }
            });
          });
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        clearCache(); // Clear profile cache on sign out
      }

      // Update session state synchronously for immediate UI response
      updateSessionStateSync(nextSession);

      // Handle role updates for authenticated sessions
      if (nextSession?.user && event !== 'SIGNED_OUT') {
        getUserRoleWithCache(nextSession.user.id).then(userRole => {
          if (isMounted) {
            setRole(userRole);
          }
        }).catch(roleError => {
          console.warn('Failed to update role on auth change:', roleError);
        });
      }
    });

    init();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateSessionStateSync, clearCache]);



  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Signing in with ${provider}...`);

      // Security: Validate provider is only Google
      if (provider !== 'google') {
        console.error('❌ Invalid OAuth provider. Only Google is supported.');
        setError('Only Google authentication is supported for security reasons.');
        setLoading(false);
        return { message: 'Only Google authentication is supported' } as AuthError;
      }

      // Security: Check if we're in a secure context (HTTPS)
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && import.meta.env.VITE_APP_ENV === 'production') {
        console.warn('⚠️ Insecure context detected. Redirecting to HTTPS...');
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          window.location.href = `https://${window.location.host}${window.location.pathname}`;
          return null;
        }
      }

      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}${import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin'}/login`
            : `${import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin'}/login`,
          // Security: Use PKCE flow for better security
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error(`❌ ${provider} sign-in error:`, error);

        // Enhanced error handling
        let errorMessage = error.message;

        // Handle specific error cases
        if (error.message.includes('popup_closed')) {
          errorMessage = 'Authentication popup was closed. Please try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('invalid')) {
          errorMessage = 'Invalid authentication request. Please try again.';
        }

        setError(errorMessage);
        setLoading(false);
        return { message: errorMessage } as AuthError;
      }

      console.log(`✅ ${provider} sign-in successful`);
      setLoading(false);
      return null;
    } catch (oauthError) {
      console.error(`❌ Unexpected ${provider} sign-in error:`, oauthError);

      // Enhanced error handling for different error types
      let errorMessage = 'An unexpected error occurred during authentication';

      if (oauthError instanceof Error) {
        if (oauthError.message.includes('popup')) {
          errorMessage = 'Popup blocked or closed. Please allow popups and try again.';
        } else if (oauthError.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (oauthError.message.includes('security')) {
          errorMessage = 'Security validation failed. Please try again.';
        }
      }

      setError(errorMessage);
      setLoading(false);
      return { message: errorMessage } as AuthError;
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Signing out user...');

      // Invalidate session in database first
      if (sessionId) {
        try {
          await supabaseClient.rpc('invalidate_user_session', {
            session_token_param: sessionId
          });
          console.log('✅ Session invalidated in database');
        } catch (sessionError) {
          console.warn('⚠️ Failed to invalidate session in database:', sessionError);
          // Continue with auth sign out even if session invalidation fails
        }
      }

      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        console.warn('Sign out warning:', error);
        // Continue with local cleanup even if server sign out fails
      }

      clearCache(); // Clear profile cache on sign out
      await updateSessionState(null);
      console.log('✅ Sign out successful');
    } catch (signOutError) {
      console.error('❌ Sign out error:', signOutError);
      setError('An error occurred during sign out');
    } finally {
      setLoading(false);
    }
  }, [updateSessionState, clearCache, sessionId]);

  // Security verification function
  const checkSecurityStatus = useCallback(async (): Promise<{ isSecure: boolean; issues?: string[] }> => {
    const issues: string[] = [];

    // Check 1: HTTPS in production
    if (typeof window !== 'undefined' && import.meta.env.VITE_APP_ENV === 'production') {
      if (window.location.protocol !== 'https:') {
        issues.push('Not using HTTPS in production environment');
      }
    }

    // Check 2: Session validity
    if (session && session.expires_at) {
      const expiresAt = session.expires_at * 1000;
      const timeUntilExpiry = expiresAt - Date.now();
      if (timeUntilExpiry < 0) {
        issues.push('Session has expired');
      } else if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
        issues.push('Session will expire soon');
      }
    }

    // Check 3: User role validation
    if (isAuthenticated && role === 'anonymous') {
      issues.push('Authenticated user has anonymous role');
    }

    // Check 4: Token presence
    if (isAuthenticated && !sessionId) {
      issues.push('Authenticated session missing token');
    }

    return {
      isSecure: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined
    };
  }, [session, isAuthenticated, role, sessionId]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        sessionId,
        role,
        loading,
        error,
        isAuthenticated,
        lastActivity,
        signInWithOAuth,
        signOut,
        refreshSession,
        clearCache,
        validateSession,
        checkSecurityStatus,
        useDummyData,
        setUseDummyData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy session validation in components
export const useSessionValidation = () => {
  const { validateSession, sessionId, isAuthenticated } = useAuth();

  const validateCurrentSession = useCallback(async () => {
    if (!isAuthenticated) return false;
    return await validateSession();
  }, [validateSession, isAuthenticated]);

  return {
    validateCurrentSession,
    sessionId,
    isAuthenticated,
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

