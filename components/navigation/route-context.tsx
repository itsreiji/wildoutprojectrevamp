'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';

interface RouteContextType {
  currentPath: string;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function useRoute() {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouterProvider');
  }
  return context;
}

interface RouterProviderProps {
  children: ReactNode;
  initialPath?: string;
}

export const RouterProvider = ({ children, initialPath = '/' }: RouterProviderProps) => {
  const contextValue: RouteContextType = useMemo(() => ({
    currentPath: initialPath,
  }), [initialPath]);

  return (
    <RouteContext.Provider value={contextValue}>
      {children}
    </RouteContext.Provider>
  );
};