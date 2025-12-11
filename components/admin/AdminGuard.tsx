'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

import { useAuth } from '@/providers/auth-provider';

interface AdminGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'editor' | 'user';
}

export const AdminGuard = ({ children, requiredRole = 'admin' }: AdminGuardProps) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If user is not authenticated or doesn't have required role
      if (!user || role === 'anonymous' ||
          (requiredRole === 'admin' && role !== 'admin') ||
          (requiredRole === 'editor' && !['admin', 'editor'].includes(role))) {
        // Redirect to login
        router.push('/login');
      }
    }
  }, [user, role, loading, requiredRole, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
          <p className="text-lg text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // If user has required role, render children
  if (user &&
      role !== 'anonymous' &&
      ((requiredRole === 'admin' && role === 'admin') ||
       (requiredRole === 'editor' && ['admin', 'editor'].includes(role)) ||
       (requiredRole === 'user' && ['admin', 'editor', 'user'].includes(role)))) {
    return children;
  }

  // Otherwise, return null (should redirect via useEffect before this renders)
  return null;
};
