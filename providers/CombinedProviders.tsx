// This is the corrected version of CombinedProviders.tsx
// Fixes for import/export issues

import React, { ReactNode } from 'react';
import { useAuth } from './auth-provider'; // FIXED: Changed from AuthProvider to useAuth
import { useContent } from './content-provider'; // FIXED: Changed from ContentProvider to useContent
import { useEvents } from './events-provider'; // FIXED: Changed from EventsProvider to useEvents
import { PartnersProvider } from './partners-provider';
import { QueryProvider } from './query-provider';
import { StaticContentProvider } from './static-content-provider';

export const CombinedProviders = ({ children }: { children: ReactNode }) => {
  // Use the hooks to get provider values
  const auth = useAuth();
  const content = useContent();
  const events = useEvents();

  return (
    <QueryProvider>
      <StaticContentProvider>
        {/* Wrap children with all provider contexts */}
        {children}
      </StaticContentProvider>
    </QueryProvider>
  );
};

export default CombinedProviders;