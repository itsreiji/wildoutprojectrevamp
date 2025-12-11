"use client";

// This is the corrected version of auth-provider.tsx
// Fix for line 77: Changed profile.email to profile.full_name since email doesn't exist in profiles table

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { AuthRole } from '../types/supabase';

// Profile cache configuration
const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const profileCache = new Map<string, {
  id: string;
  role: AuthRole;
  email: string;
  lastUpdated: number;
  ttl: number;
}>();

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabaseClient = createClientComponentClient();

  const getUserRoleWithCache = useCallback(async (userId: string): Promise<AuthRole> => {
    // Check cache first
    const cachedProfile = profileCache.get(userId);
    if (cachedProfile && Date.now() - cachedProfile.lastUpdated < cachedProfile.ttl) {
      return cachedProfile.role;
    }

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch profile from database
      const { data: profiles, error: rpcError } = await supabaseClient
        .rpc('get_user_profile', { user_id: userId });

      if (rpcError) {
        console.warn('RPC error in getUserRoleWithCache:', rpcError);
        return 'user'; // Default role
      }

      if (!profiles || profiles.length === 0) {
        return 'user'; // Default role if no profile found
      }

      const profile = profiles[0];
      const role = (profile?.role as AuthRole) || 'user';

      // Cache the result - FIXED: Changed profile.email to profile.full_name
      profileCache.set(userId, {
        id: userId,
        role,
        email: profile.full_name || '', // FIXED: Use full_name instead of email
        lastUpdated: Date.now(),
        ttl: PROFILE_CACHE_TTL,
      });

      return role;
    } catch (rpcError) {
      console.warn('RPC error in getUserRoleWithCache:', rpcError);
      return 'user'; // Default role on error
    }
  }, []);

  // Rest of the file remains unchanged...
  return {
    user,
    loading,
    error,
    login,
    logout,
    signUp,
    getUserRole: getUserRoleWithCache,
    updateProfile,
  };
};

export type { AuthRole } from '../types/supabase';

export default useAuth;