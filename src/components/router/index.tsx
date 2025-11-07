import React, { useState, useEffect, createContext, useContext, memo } from 'react';

// Route interface for type safety
interface Route {
  path: string;
  component: React.ComponentType;
}

// Router context interface
interface RouterContextValue {
  currentPath: string;
  navigate: (path: string) => void;
}

// Create router context
const RouterContext = createContext<RouterContextValue | undefined>(undefined);

// Custom hook for using router
export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
};

// Router provider component
const RouterProviderComponent = ({ children }: { children: React.ReactNode }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Initialize with current window path
    return window.location.pathname;
  });

  useEffect(() => {
    // Handle initial route
    const handleRoute = () => {
      setCurrentPath(window.location.pathname);
    };

    // Handle browser back/forward
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for popstate events
    window.addEventListener('popstate', handlePopState);

    // Initial route
    handleRoute();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Navigation function
  const navigate = (path: string) => {
    setCurrentPath(path);

    // Update URL without reloading
    window.history.pushState({}, '', path);

    // Scroll to top on navigation
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const RouterProvider = memo(RouterProviderComponent);
RouterProvider.displayName = 'RouterProvider';

// Router component that renders based on routes
interface RouterProps {
  routes: Record<string, React.ComponentType>;
}

const RouterComponent = memo(({ routes }: RouterProps) => {
  const { currentPath } = useRouter();

  // Find matching route
  const RouteComponent = routes[currentPath] || routes['/404'];

  return RouteComponent ? <RouteComponent /> : null;
});

export const Router = RouterComponent;
Router.displayName = 'Router';
