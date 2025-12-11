'use client';

import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const { signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      await signOut();
      router.push('/login');
      router.refresh();
    };

    // Only perform logout if not already loading
    if (!loading) {
      performLogout();
    }
  }, [signOut, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}