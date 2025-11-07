import React from 'react';
import { ThemeProvider } from 'next-themes';
import { ContentProvider } from './contexts/ContentContext';
import { Router, RouterProvider } from './components/router/index';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AllEventsPage } from './components/AllEventsPage';
import { Toaster } from './components/ui/sonner';
import TestComponents from './components/ui/test-components';

function App() {
  // Use dummy data in development by default
  const isDevelopment = import.meta.env.DEV;
  const useDummyDataDefault = isDevelopment;

  // Define routes object mapping paths to components
  const routes = {
    '/': LandingPage,
    '/admin/*': Dashboard,
    '/events': AllEventsPage,
    '/test-ui': TestComponents,
    '/404': () => <div className="p-8 text-center text-white">Page not found</div>,
  };

  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <ContentProvider useDummyData={useDummyDataDefault}>
        <RouterProvider>
          <Router routes={routes} />
        </RouterProvider>
        <Toaster />
      </ContentProvider>
    </ThemeProvider>
  );
}

export default App;
