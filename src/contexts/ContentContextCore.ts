import { createContext, useContext } from 'react';
import type { ContentContextType } from '../types/content';

export const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export { ContentProvider } from './ContentContext';
