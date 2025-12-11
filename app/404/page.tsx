// Fixed 404 page - removed direct useAuth hook call from server component

import { Metadata } from 'next';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary sm:text-8xl">404</h1>
          <p className="mt-4 text-xl font-semibold text-foreground">
            Page Not Found
          </p>
        </div>
        <p className="mb-8 text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          className={buttonVariants({ variant: 'default' })}
          href="/"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
