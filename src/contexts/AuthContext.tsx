import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseClient } from '../supabase/client';
import type { Session, User, AuthError } from '@supabase/auth-js';

type AuthRole = 'admin' | 'editor' | 'user' | 'anonymous';

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

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: AuthRole;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<AuthError | null>;
  sendMagicLink: (email: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AuthRole>('anonymous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateSessionState = (incomingSession: Session | null) => {
    const incomingUser = incomingSession?.user ?? null;
    setSession(incomingSession);
    setUser(incomingUser);
    setRole(getRoleFromUser(incomingUser));
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabaseClient.auth.getSession();

        if (!isMounted) return;

        updateSessionState(initialSession);
      } catch (getSessionError) {
        console.error('Auth initialization failed', getSessionError);
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
    } = supabaseClient.auth.onAuthStateChange((_event: string, nextSession: Session | null) => {
      updateSessionState(nextSession);
    });

    init();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return error;
    }

    updateSessionState(data.session ?? null);
    setLoading(false);
    return null;
  };

  const sendMagicLink = async (email: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}${import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin'}/login`
            : `${import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin'}/login`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return error;
    }

    setLoading(false);
    return null;
  };

  const signOut = async () => {
    setLoading(true);
    await supabaseClient.auth.signOut();
    updateSessionState(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        error,
        signInWithEmail,
        sendMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

