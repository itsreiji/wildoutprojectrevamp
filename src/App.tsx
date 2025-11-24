import React from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/ContentContext';
import { EventsProvider } from './contexts/EventsContext';
import { PartnersProvider } from './contexts/PartnersContext';
import { TeamProvider } from './contexts/TeamContext';
import { StaticContentProvider } from './contexts/StaticContentContext';
import { Router, RouterProvider } from './components/router';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AllEventsPage } from './components/AllEventsPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { AdminGuard } from './components/admin/AdminGuard';
import { Toaster } from './components/ui/sonner';
import { SAdminPage } from './components/dashboard/SAdminPage';
import TestComponents from './components/ui/test-components';

function App() {
  const isDevelopment = import.meta.env.DEV;
  // Use Supabase data by default, even in development
  // Set VITE_USE_DUMMY_DATA=true in .env to use dummy data for testing
  const useDummyDataDefault = import.meta.env.VITE_USE_DUMMY_DATA === 'true';
  const adminBasePath = import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin';

  const AdminRoute: React.FC = () => (
    <AdminGuard>
      <Dashboard />
    </AdminGuard>
  );

  const routes = {
    '/': LandingPage,
    '/events': AllEventsPage,
    '/register': RegisterPage,
    '/login': LoginPage,
    '/admin/login': LoginPage, // Keep legacy /admin/login for backward compatibility
    [`${adminBasePath}`]: SAdminPage,
    [`${adminBasePath}/login`]: LoginPage, // New admin login path
    [`${adminBasePath}/*`]: AdminRoute,
    '/test-ui': TestComponents,
    '/404': () => <div className="p-8 text-center text-white">Page not found</div>,
  };

  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <AuthProvider>
        <ContentProvider useDummyData={useDummyDataDefault}>
          <EventsProvider useDummyData={useDummyDataDefault}>
            <PartnersProvider useDummyData={useDummyDataDefault}>
              <TeamProvider useDummyData={useDummyDataDefault}>
                <StaticContentProvider useDummyData={useDummyDataDefault}>
                  <RouterProvider>
                    <Router routes={routes} />
                  </RouterProvider>
                  <Toaster />
                </StaticContentProvider>
              </TeamProvider>
            </PartnersProvider>
          </EventsProvider>
        </ContentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;