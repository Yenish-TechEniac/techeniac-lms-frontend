'use client';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';

// TODO(FE-OBSERVABILITY): Wire up external error reporting service (e.g., Sentry)

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <Typography as="h1" variant="h3">
        Something went wrong
      </Typography>
      <Typography variant="muted" className="mt-2">
        An unexpected error occurred while rendering this page.
      </Typography>
      {error.digest && (
        <Typography variant="code" className="mt-2 text-xs">
          Reference: {error.digest}
        </Typography>
      )}
      <Button onClick={() => retry()} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
