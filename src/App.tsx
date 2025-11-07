import React from 'react';
import { ThemeProvider } from 'next-themes';
import { ContentProvider } from './contexts/ContentContext';
import { Router, RouterProvider } from './components/router/index';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AllEventsPage } from './components/AllEventsPage';
import { Toaster } from './components/ui/sonner';
import TestComponents from './components/ui/test-components';

// Define routes object mapping paths to components
const routes = {
  '/': LandingPage,
  '/admin': Dashboard,
  '/events': AllEventsPage,
  '/test-ui': TestComponents,
  '/404': () => <div className="p-8 text-center text-white">Page not found</div>,
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <ContentProvider>
        <RouterProvider>
          <Router routes={routes} />
        </RouterProvider>
      </ContentProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
