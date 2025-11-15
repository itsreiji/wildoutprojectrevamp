import React from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/ContentContext';
import { Router, RouterProvider } from './components/router';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AllEventsPage } from './components/AllEventsPage';
import { LoginPage } from './components/auth/LoginPage';
import { AdminGuard } from './components/admin/AdminGuard';
import { Toaster } from './components/ui/sonner';
import TestComponents from './components/ui/test-components';

function App() {
  const isDevelopment = import.meta.env.DEV;
  const useDummyDataDefault = isDevelopment;
  const adminBasePath = import.meta.env.VITE_ADMIN_BASE_PATH || '/sadmin';

  const AdminRoute: React.FC = () => (
    <AdminGuard>
      <Dashboard />
    </AdminGuard>
  );

  const routes = {
    '/': LandingPage,
    '/events': AllEventsPage,
    '/admin/login': LoginPage, // Keep legacy /admin/login for backward compatibility
    [`${adminBasePath}/login`]: LoginPage, // New admin login path
    [`${adminBasePath}/*`]: AdminRoute,
    '/test-ui': TestComponents,
    '/404': () => <div className="p-8 text-center text-white">Page not found</div>,
  };

  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <AuthProvider>
        <ContentProvider useDummyData={useDummyDataDefault}>
          <RouterProvider>
            <Router routes={routes} />
          </RouterProvider>
          <Toaster />
        </ContentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
