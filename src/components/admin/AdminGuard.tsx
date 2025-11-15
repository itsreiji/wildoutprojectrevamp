import React from 'react';
import { useRouter } from '../router';
import { useAuth } from '../../contexts/AuthContext';

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, role } = useAuth();
  const { navigate } = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040404] text-white">
        <p className="text-lg font-semibold">Checking your access…</p>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#040404] text-white p-6">
        <p className="text-center text-xl font-semibold">Admin access required</p>
        <p className="max-w-sm text-center text-sm text-white/60">
          You must sign in with an administrator account to manage content. Please use the admin
          login form to continue.
        </p>
        <button
          type="button"
          onClick={() => navigate(`${import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin'}/login`)}
          className="rounded-full border border-white/60 px-6 py-2 text-sm font-semibold text-white transition hover:border-white/90 hover:text-white"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

