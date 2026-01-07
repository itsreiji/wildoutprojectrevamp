import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { ContentProvider } from './contexts/ContentContextCore';
import { RouterProvider, useRouter } from './components/Router';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AllEventsPage } from './components/AllEventsPage';
import { LoginPage } from './components/LoginPage';
import { Toaster } from './components/ui/sonner';
import { supabase } from './lib/supabase';
import { Session, AuthChangeEvent } from '@jsr/supabase__supabase-js';

function AppContent() {
  const { currentPage, navigateTo } = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Protection logic
  useEffect(() => {
    if (currentPage === 'admin' && isAuthenticated === false) {
      navigateTo('login');
    }
    if (currentPage === 'login' && isAuthenticated === true) {
      navigateTo('admin');
    }
  }, [currentPage, isAuthenticated, navigateTo]);

  if (isAuthenticated === null && currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E93370]/30 border-t-[#E93370] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'admin' && <Dashboard />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'all-events' && <AllEventsPage />}
      <Toaster />
    </>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ContentProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </ContentProvider>
    </ThemeProvider>
  );
}

export default App;
