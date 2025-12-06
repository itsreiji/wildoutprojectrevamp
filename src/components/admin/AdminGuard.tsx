import React, { useEffect, useState } from 'react';
import { useRouter } from '../router';
import { useAuth } from '../../contexts/AuthContext';

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, role, user, isAuthenticated, validateSession } = useAuth();
  const { navigate } = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  // Validate session on mount and when auth state changes
  useEffect(() => {
    const checkSession = async () => {
      if (loading) {
        setIsValidating(true);
        return;
      }

      if (!isAuthenticated || !user) {
        setIsValidating(false);
        setSessionValid(false);
        return;
      }

      // Validate session
      setIsValidating(true);
      try {
        const isValid = await validateSession();
        setSessionValid(isValid);
        if (!isValid) {
          console.log('🚫 Session validation failed, redirecting to login');
        }
      } catch (error) {
        console.error('Session validation error:', error);
        setSessionValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    checkSession();
  }, [loading, isAuthenticated, user, validateSession]);

  // Add useEffect for redirects
  useEffect(() => {
    if (loading || isValidating || sessionValid === null) return;

    if (sessionValid === false || !isAuthenticated || !user) {
      navigate(`${import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin'}/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (role === 'anonymous') return;

    if (role !== 'admin') {
      // Could navigate here too, but show denied page for now
    }
  }, [loading, isValidating, sessionValid, isAuthenticated, user, role, navigate]);

  // Debug logging
  console.log('🔐 AdminGuard check:', { loading, isValidating, sessionValid, role, user: user?.email, isAuthenticated });

  // Show loading state while checking
  if (loading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040404] text-white">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Checking your access…</p>
          <p className="text-sm text-white/60">Please wait while we verify your permissions</p>
        </div>
      </div>
    );
  }

  // If session validation failed or not authenticated, return null or loading instead of navigate
  if (sessionValid === false || !isAuthenticated || !user) {
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

