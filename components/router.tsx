'use client';

import { createContext, ReactNode, useContext } from 'react';

// Define the shape of our route context
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

export function RouterProvider({ children, initialPath = '/' }: RouterProviderProps) {
  // In Next.js, routing is handled by the file system, so we're just providing
  // a context that might be used by other components that expect it
  const contextValue: RouteContextType = {
    currentPath: initialPath,
  };

  return (
    <RouteContext.Provider value={contextValue}>
      {children}
    </RouteContext.Provider>
  );
}

// Since Next.js handles routing via file system, we don't need the actual Router component
// This is just a placeholder to satisfy the import in the original App component
interface RouterProps {
  routes: Record<string, React.ComponentType>;
}

export function Router({ routes }: RouterProps) {
  // This is a placeholder component since Next.js handles routing via file structure
  return null;
}