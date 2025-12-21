import React, { useState, useEffect, memo, useCallback, Suspense } from 'react';
import {
  DashboardAbout,
  DashboardEvents,
  DashboardGallery,
  DashboardHero,
  DashboardHome,
  DashboardLayout,
  DashboardPartners,
  DashboardSettings,
  DashboardTeam,
} from '../dashboard/index';
import { RouterContext, useRouter } from './RouterContext';

export {
  DashboardAbout,
  DashboardEvents,
  DashboardGallery,
  DashboardHero,
  DashboardHome,
  DashboardLayout,
  DashboardPartners,
  DashboardSettings,
  DashboardTeam,
  useRouter,
};

// Router provider component
const RouterProviderComponent = ({ children }: { children: React.ReactNode }) => {
  // Configurable admin base path - defaults to /admin
  const adminBasePath = import.meta.env.VITE_ADMIN_BASE_PATH || '/admin';

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
  const navigate = useCallback((path: string) => {
    setCurrentPath(path);

    // Update URL without reloading
    window.history.pushState({}, '', path);

    // Scroll to top on navigation
    window.scrollTo(0, 0);
  }, []);

  // Redirect /admin to /admin/home
  useEffect(() => {
    const adminBasePath = import.meta.env.VITE_ADMIN_BASE_PATH || '/admin';
    if (currentPath === adminBasePath) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      navigate(`${adminBasePath}/home`);
    }
  }, [currentPath, navigate]);

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

  // Function to get sub-path assuming current path is under admin base path
  const getCurrentSubPath = (): string => {
    return getSubPath(adminBasePath);
  };

  // Function to construct admin paths
  const getAdminPath = (subPath?: string): string => {
    const path = subPath ? `/${subPath}` : '';
    return `${adminBasePath}${path}`;
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate, getSubPath, getCurrentSubPath, adminBasePath, getAdminPath }}>
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

// Find matching route - support exact matches and nested routes
const findMatchingRoute = (path: string, routes: Record<string, React.ComponentType>): React.ComponentType | undefined => {
  // First try exact match
  if (routes[path]) {
    return routes[path];
  }

  // Then try nested route matching
  for (const routePath of Object.keys(routes)) {
    // Handle routes like "/sadmin/*" (configurable admin base path)
    if (routePath.endsWith('/*')) {
      const basePath = routePath.slice(0, -2);
      if (path.startsWith(basePath + '/') || path === basePath) {
        return routes[routePath];
      }
    }

    // Handle routes like "/sadmin" matching /sadmin/something
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

const RouterComponent = memo(function RouterComponent({ routes }: RouterProps) {
  const { currentPath } = useRouter();

  const RouteComponent = findMatchingRoute(currentPath, routes) || routes['/404'];

  return RouteComponent ? (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      {React.createElement(RouteComponent)}
    </Suspense>
  ) : null;
});

export const Router = RouterComponent;
Router.displayName = 'Router';
