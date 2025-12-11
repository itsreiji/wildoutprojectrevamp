'use client';

import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <div className="text-9xl font-bold text-gray-400">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h1>
        <p className="text-gray-600 mt-2">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
