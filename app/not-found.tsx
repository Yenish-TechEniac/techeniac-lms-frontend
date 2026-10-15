import Link from 'next/link';

import { getButtonClassName } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="text-foreground text-2xl font-bold tracking-tight">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        The requested resource could not be found.
      </p>
      <Link href="/" className={getButtonClassName('primary', 'mt-4')}>
        Return Home
      </Link>
    </div>
  );
}
