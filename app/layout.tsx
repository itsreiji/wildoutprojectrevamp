import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ThemeProvider } from 'next-themes';

import { QueryProvider } from './providers/query-provider';
import { AuthProvider } from './providers/auth-provider';
import { ContentProvider } from './providers/content-provider';
import { EventsProvider } from './providers/events-provider';
import { PartnersProvider } from './providers/partners-provider';
import { StaticContentProvider } from './providers/static-content-provider';
import { TeamProvider } from './providers/team-provider';
import { Toaster } from './components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WildOut! - Event Management Platform',
  description: 'Comprehensive event management platform with admin dashboard and landing page',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <ContentProvider>
                <EventsProvider>
                  <PartnersProvider>
                    <TeamProvider>
                      <StaticContentProvider>
                        {children}
                        <Toaster />
                      </StaticContentProvider>
                    </TeamProvider>
                  </PartnersProvider>
                </EventsProvider>
              </ContentProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}