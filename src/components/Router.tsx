import React, { useState, useEffect } from 'react';

type Page = 'landing' | 'admin' | 'all-events';

interface RouterContextValue {
  currentPage: Page;
  navigateTo: (page: Page) => void;
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

  useEffect(() => {
    // Handle initial route
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/events') {
      setCurrentPage('all-events');
    } else {
      setCurrentPage('landing');
    }

    // Handle browser back/forward
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentPage('admin');
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
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (page === 'all-events') {
      window.history.pushState({}, '', '/events');
    } else {
      window.history.pushState({}, '', '/');
    }
    
    // Scroll to top on navigation
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ currentPage, navigateTo }}>
      {children}
    </RouterContext.Provider>
  );
});

RouterProvider.displayName = 'RouterProvider';
