'use client';

import React, { ReactNode } from 'react';

import { AuthProvider } from './auth-provider';
import { ContentProvider } from './content-provider';
import { EventsProvider } from './events-provider';
import { PartnersProvider } from './partners-provider';
import { QueryProvider } from './query-provider';
import { StaticContentProvider } from './static-content-provider';
import { TeamProvider } from './team-provider';

interface CombinedProvidersProps {
  children: ReactNode;
}

export const CombinedProviders = ({ children }: CombinedProvidersProps) => {
  return (
    <QueryProvider>
      <AuthProvider>
        <ContentProvider>
          <StaticContentProvider>
            <EventsProvider>
              <PartnersProvider>
                <TeamProvider>
                  {children}
                </TeamProvider>
              </PartnersProvider>
            </EventsProvider>
          </StaticContentProvider>
        </ContentProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
