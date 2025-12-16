import { useEffect } from 'react';
import { useRouter } from '../components/router';
import { useAuth } from '../contexts/AuthContext';
import { supabaseClient } from '../supabase/client';

export const AuthCallbackPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const setUser = auth?.setUser;
 const setRole = auth?.setRole;

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          router.navigate('/login?error=auth_failed');
          return;
        }

        if (!session) {
          console.error('No session found');
          router.navigate('/login?error=no_session');
          return;
        }

        // Update auth context
        setUser(session.user);
        
        // Get user role (this will be handled by the auth context)
        // Just trigger a state update to ensure the role is set
        setRole(session.user ? 'user' : 'anonymous');

        // Redirect to the appropriate page
        const redirectTo = sessionStorage.getItem('redirectTo') || '/';
        router.navigate(redirectTo);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        router.navigate('/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router, setUser, setRole, auth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
        </div>
        <p className="text-lg font-medium text-white">Completing authentication...</p>
        <p className="mt-2 text-sm text-gray-400">Please wait while we sign you in.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
