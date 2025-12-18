import React, { useState, useEffect, createContext, useContext, memo } from 'react';
import { AuthCallbackPage } from '../../pages/AuthCallbackPage';
import { LoginPage } from '../../components/auth/LoginPage';
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

const MemoDashboardAbout = memo(DashboardAbout);
const MemoDashboardEvents = memo(DashboardEvents);
const MemoDashboardGallery = memo(DashboardGallery);
const MemoDashboardHero = memo(DashboardHero);
const MemoDashboardHome = memo(DashboardHome);
const MemoDashboardLayout = memo(DashboardLayout);
const MemoDashboardPartners = memo(DashboardPartners);
const MemoDashboardSettings = memo(DashboardSettings);
const MemoDashboardTeam = memo(DashboardTeam);

const routes = {
  '/': MemoDashboardHome,
  '/home': MemoDashboardHome,
  '/about': MemoDashboardAbout,
  '/events': MemoDashboardEvents,
  '/gallery': MemoDashboardGallery,
  '/hero': MemoDashboardHero,
  '/partners': MemoDashboardPartners,
  '/team': MemoDashboardTeam,
  '/settings': MemoDashboardSettings,
  '/login': LoginPage,
  '/auth/callback': AuthCallbackPage,
  // Admin routes - these will be wrapped by AdminGuard in App.tsx
  '/admin': MemoDashboardHome,
  '/admin/home': MemoDashboardHome,
  '/admin/about': MemoDashboardAbout,
  '/admin/events': MemoDashboardEvents,
  '/admin/gallery': MemoDashboardGallery,
  '/admin/hero': MemoDashboardHero,
  '/admin/partners': MemoDashboardPartners,
  '/admin/team': MemoDashboardTeam,
  '/admin/settings': MemoDashboardSettings,
};

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
};

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
  adminBasePath: string;
  getAdminPath: (subPath?: string) => string;
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
  const navigate = (path: string) => {
    setCurrentPath(path);

    // Update URL without reloading
    window.history.pushState({}, '', path);

    // Scroll to top on navigation
    window.scrollTo(0, 0);
  };

  // Redirect /admin to /admin/home
  useEffect(() => {
    const adminBasePath = import.meta.env.VITE_ADMIN_BASE_PATH || '/admin';
    if (currentPath === adminBasePath) {
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

  const RouteComponent = findMatchingRoute(currentPath) || routes['/404'];

  return RouteComponent ? <RouteComponent /> : null;
});

export const Router = RouterComponent;
Router.displayName = 'Router';
