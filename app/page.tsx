import Link from 'next/link';

import { getButtonClassName } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <main className="flex max-w-xl flex-col items-center gap-4">
        <Typography as="h1" variant="h1">
          Techeniac LMS
        </Typography>
        <Typography variant="lead">
          Modern learning management platform for students, instructors, and administrators.
        </Typography>
        <div className="mt-4 flex gap-4">
          <Link href="/login" className={getButtonClassName('primary')}>
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
