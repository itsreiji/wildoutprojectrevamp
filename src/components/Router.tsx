import React, { useState, useEffect } from 'react';

type Page = 'landing' | 'admin' | 'all-events' | 'login';

interface RouterContextValue {
  currentPage: Page;
  currentPath: string;
  navigateTo: (page: Page) => void;
  navigate: (path: string) => void;
  getAdminPath: () => string;
}

const RouterContext = React.createContext<RouterContextValue | undefined>(undefined);

export const useRouter = () => {
  const context = React.useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
};

export const RouterProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    // Handle initial route
    const path = window.location.pathname;
    setCurrentPath(path);
    if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/events') {
      setCurrentPage('all-events');
    } else {
      setCurrentPage('landing');
    }

    // Handle browser back/forward
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/events') {
        setCurrentPage('all-events');
      } else {
        setCurrentPage('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);

    // Update URL without reloading
    let path = '/';
    if (page === 'admin') {
      path = '/admin';
    } else if (page === 'login') {
      path = '/login';
    } else if (page === 'all-events') {
      path = '/events';
    }
    
    window.history.pushState({}, '', path);
    setCurrentPath(path);

    // Scroll to top on navigation
    window.scrollTo(0, 0);
  };

  const navigate = (path: string) => {
    // Map paths to page types
    let page: Page = 'landing';
    
    if (path === '/admin') {
      page = 'admin';
    } else if (path === '/login') {
      page = 'login';
    } else if (path === '/events') {
      page = 'all-events';
    } else if (path === '/') {
      page = 'landing';
    }

    setCurrentPage(page);
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    
    // Scroll to top on navigation
    window.scrollTo(0, 0);
  };

  const getAdminPath = () => {
    return '/admin';
  };

  return (
    <RouterContext.Provider value={{ currentPage, currentPath, navigateTo, navigate, getAdminPath }}>
      {children}
    </RouterContext.Provider>
  );
});

RouterProvider.displayName = 'RouterProvider';
