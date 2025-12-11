import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';

import { CombinedProviders } from '../providers/CombinedProviders';
import { metadata } from './metadata';

const inter = Inter({ subsets: ['latin'] });

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={inter.className}>
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <CombinedProviders>
            {children}
          </CombinedProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
