import React from 'react';
import { useRouter } from '../router';
import { useAuth } from '../../contexts/AuthContext';

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, role, user, isAuthenticated } = useAuth();
  const { navigate } = useRouter();

  // Debug logging
  console.log('🔐 AdminGuard check:', { loading, role, user: user?.email, isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040404] text-white">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Checking your access…</p>
          <p className="text-sm text-white/60">Please wait while we verify your permissions</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log('🚫 Not authenticated, redirecting to login');
    navigate(`${import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin'}/login`);
    return null;
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

