import Link from 'next/link';

import { getButtonClassName } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <Typography as="h1" variant="h2" className="font-bold">
        404 - Page Not Found
      </Typography>
      <Typography variant="muted" className="mt-2">
        The requested resource could not be found.
      </Typography>
      <Link href="/" className={getButtonClassName('primary', 'mt-4')}>
        Return Home
      </Link>
    </div>
  );
}
