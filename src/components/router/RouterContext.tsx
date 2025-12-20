import { createContext, useContext } from 'react';

// Router context interface
export interface RouterContextValue {
  currentPath: string;
  navigate: (path: string) => void;
  getSubPath: (basePath: string) => string;
  getCurrentSubPath: () => string;
  adminBasePath: string;
  getAdminPath: (subPath?: string) => string;
}

// Create router context
export const RouterContext = createContext<RouterContextValue | undefined>(undefined);

// Custom hook for using router
export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
};
