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
  getSubPath: (basePath: string) => string;
  getCurrentSubPath: () => string;
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

  // Function to get sub-path for a given base path
  const getSubPath = (basePath: string): string => {
    let actualBasePath = basePath;
    if (basePath.endsWith('/*')) {
      actualBasePath = basePath.slice(0, -2); // Remove /*
    }

    if (currentPath === actualBasePath) {
      return '';
    }
    if (currentPath.startsWith(actualBasePath + '/')) {
      return currentPath.slice(actualBasePath.length + 1);
    }
    return '';
  };

  // Function to get sub-path assuming current path is under /admin
  const getCurrentSubPath = (): string => {
    return getSubPath('/admin');
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate, getSubPath, getCurrentSubPath }}>
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

  // Find matching route - support exact matches and nested routes
  const findMatchingRoute = (path: string): React.ComponentType | undefined => {
    // First try exact match
    if (routes[path]) {
      return routes[path];
    }

    // Then try nested route matching
    for (const routePath of Object.keys(routes)) {
      // Handle routes like "/admin/*"
      if (routePath.endsWith('/*')) {
        const basePath = routePath.slice(0, -2);
        if (path.startsWith(basePath + '/') || path === basePath) {
          return routes[routePath];
        }
      }

      // Handle routes like "/admin" matching /admin/something
      if (path.startsWith(routePath + '/') && routePath !== '/') {
        return routes[routePath];
      }
    }

    // Fallback to home route if registered and no other match
    if (routes['/']) {
      return routes['/'];
    }

    return undefined;
  };

  const RouteComponent = findMatchingRoute(currentPath) || routes['/404'];

  return RouteComponent ? <RouteComponent /> : null;
});

export const Router = RouterComponent;
Router.displayName = 'Router';
