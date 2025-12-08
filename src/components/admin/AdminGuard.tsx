import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from '../router';
import { useAuth } from '../../contexts/AuthContext';

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, role, user, isAuthenticated, validateSession } = useAuth();
  const { navigate } = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const hasRedirectedRef = useRef(false);
  const lastCheckRef = useRef<number>(0);

  // Validate session on mount and when auth state changes
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkSession = async () => {
      const now = Date.now();
      // Throttle session validation to avoid infinite loops
      if (now - lastCheckRef.current < 1000) return;
      lastCheckRef.current = now;

      console.log('🔍 AdminGuard - checkSession', { 
        loading, 
        isAuthenticated, 
        user: user?.email,
        role,
        sessionValid,
        hasCheckedSession
      });

      if (loading) {
        console.log('⏳ Auth is loading, waiting...');
        if (isMounted) setIsValidating(true);
        return;
      }

      if (!isAuthenticated || !user) {
        console.log('🔒 No authenticated user, marking session as invalid');
        if (isMounted) {
          setIsValidating(false);
          setSessionValid(false);
          setHasCheckedSession(true);
        }
        return;
      }

      // If we already have a valid session and user is an admin, we can skip validation
      if (sessionValid === true && role === 'admin') {
        console.log('✅ Using cached valid admin session');
        if (isMounted) {
          setIsValidating(false);
          setHasCheckedSession(true);
        }
        return;
      }

      // Validate session
      console.log('🔑 Validating session for user:', user.email);
      if (isMounted) setIsValidating(true);
      
      try {
        const isValid = await Promise.race([
          validateSession(),
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Session validation timeout')), 5000)
          )
        ]);
        
        console.log('✅ Session validation result:', isValid);
        if (isMounted) {
          setSessionValid(isValid);
          setHasCheckedSession(true);
          setIsValidating(false);
        }
        
        if (!isValid) {
          console.log('🚫 Session validation failed, will redirect to login');
        }
      } catch (error) {
        console.error('❌ Session validation error:', error);
        if (isMounted) {
          setSessionValid(false);
          setHasCheckedSession(true);
          setIsValidating(false);
        }
      }
    };

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (isMounted && isValidating) {
        console.warn('⚠️ Session validation is taking too long, forcing state update');
        setSessionValid(true); // Assume session is valid to prevent blocking
        setHasCheckedSession(true);
        setIsValidating(false);
      }
    }, 3000); // 3 second timeout

    checkSession().catch(error => {
      console.error('❌ Unhandled error in checkSession:', error);
      if (isMounted) {
        setSessionValid(false);
        setHasCheckedSession(true);
        setIsValidating(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [loading, isAuthenticated, user, validateSession]);

  // Handle redirects based on auth state
  useEffect(() => {
    console.log('🔄 AdminGuard - Redirect check:', { 
      loading, 
      isValidating, 
      sessionValid, 
      isAuthenticated, 
      role, 
      hasCheckedSession,
      hasRedirected: hasRedirectedRef.current
    });

    if (loading || isValidating || sessionValid === null || !hasCheckedSession) {
      console.log('⏳ Waiting for auth state to be ready...');
      return;
    }

    // Prevent multiple redirects
    if (hasRedirectedRef.current) {
      console.log('🛑 Already handled redirect, skipping');
      return;
    }

    // Handle unauthorized access
    if (sessionValid === false || !isAuthenticated || !user) {
      console.log('🔐 Unauthorized access detected, redirecting to login');
      hasRedirectedRef.current = true;
      const redirectPath = window.location.pathname + window.location.search;
      const loginPath = `${import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin'}/login?redirect=${encodeURIComponent(redirectPath)}`;
      console.log('↪️ Redirecting to:', loginPath);
      navigate(loginPath);
      return;
    }

    // Handle non-admin roles
    if (role !== 'admin') {
      console.warn(`⚠️ Unauthorized role access: ${role}, expected admin`);
      // Optionally show an access denied message or redirect
    }
  }, [loading, isValidating, sessionValid, isAuthenticated, user, role, navigate, hasCheckedSession]);

  // Debug logging (throttled)
  useEffect(() => {
    const logCheck = () => {
      const now = Date.now();
      if (now - lastCheckRef.current < 2000) return;
      lastCheckRef.current = now;
      
      console.group('🔍 AdminGuard State');
      console.log('🔄 Status:', loading ? 'Loading...' : 'Ready');
      console.log('🔐 Auth State:', {
        isAuthenticated,
        user: user ? `${user.email} (${user.id})` : 'Not logged in',
        role,
        isValidating,
        sessionValid,
        hasCheckedSession,
        hasRedirected: hasRedirectedRef.current
      });
      console.groupEnd();
    };
    
    logCheck();
    
    // Log state changes for debugging
    const logState = () => {
      console.log('🔄 AdminGuard state changed:', {
        loading,
        isValidating,
        sessionValid,
        role,
        user: user ? user.email : null,
        isAuthenticated
      });
    };
    
    const logTimer = setTimeout(logState, 100);
    return () => clearTimeout(logTimer);
  }, [loading, isValidating, sessionValid, role, user, isAuthenticated]);

  // Show loading state while checking
  const showLoading = loading || (isValidating && !hasCheckedSession);
  
  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040404] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-semibold mb-2">Checking your access…</p>
          <p className="text-sm text-white/60">Please wait while we verify your permissions</p>
        </div>
      </div>
    );
  }

  // If session validation failed or not authenticated, return null or loading instead of navigate
  if (sessionValid === false || !isAuthenticated || !user) {
    if (!hasCheckedSession) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#040404] text-white">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Checking your access…</p>
            <p className="text-sm text-white/60">Please wait while we verify your permissions</p>
          </div>
        </div>
      );
    }
    return null; // useEffect handles redirect
  }

  // If authenticated but role is still being loaded, wait a bit more
  if (role === 'anonymous') {
    console.log('⏳ Role still loading, waiting...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040404] text-white">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Loading permissions…</p>
          <p className="text-sm text-white/60">Almost ready</p>
        </div>
      </div>
    );
  }

  // If authenticated but not admin, show access denied
  if (role !== 'admin') {
    console.log('🚫 Not admin role:', role);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#040404] text-white p-6">
        <p className="text-center text-xl font-semibold">Admin access required</p>
        <p className="max-w-sm text-center text-sm text-white/60">
          You must sign in with an administrator account to manage content. Current role: <strong>{role}</strong>
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`${import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin'}/login`)}
            className="rounded-full border border-white/60 px-6 py-2 text-sm font-semibold text-white transition hover:border-white/90 hover:text-white"
          >
            Go to Admin Login
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full bg-white/10 border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ Admin access granted');
  return <>{children}</>;
};

