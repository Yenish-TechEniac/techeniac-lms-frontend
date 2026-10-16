'use client';

import './globals.css';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';

// TODO(FE-OBSERVABILITY): Wire up external error reporting service (e.g., Sentry)

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center antialiased">
        <Typography as="h1" variant="h2">
          Something went wrong
        </Typography>
        <Typography variant="muted" className="mt-2">
          A critical error occurred. Please try again.
        </Typography>
        {error.digest && (
          <Typography variant="code" className="mt-2 text-xs">
            Reference: {error.digest}
          </Typography>
        )}
        <Button onClick={() => retry()} className="mt-4">
          Try again
        </Button>
      </body>
    </html>
  );
}
