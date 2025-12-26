import React from 'react';
import { ContentProvider } from './contexts/ContentContext';
import { RouterProvider, useRouter } from './components/Router';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AllEventsPage } from './components/AllEventsPage';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { currentPage } = useRouter();

  return (
    <>
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'admin' && <Dashboard />}
      {currentPage === 'all-events' && <AllEventsPage />}
      <Toaster />
    </>
  );
}

function App() {
  return (
    <ContentProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </ContentProvider>
  );
}

export default App;
