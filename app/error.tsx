'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report error to an external observability service in production
    // Avoid console.log per strict code conventions
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="text-foreground text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        An unexpected error occurred while rendering this page.
      </p>
      <Button onClick={() => reset()} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
