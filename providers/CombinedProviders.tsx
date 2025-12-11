"use client";

// This is the corrected version of CombinedProviders.tsx
// Fixes for import/export issues

import React, { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { StaticContentProvider } from './static-content-provider';

export const CombinedProviders = ({ children }: { children: ReactNode }) => {
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