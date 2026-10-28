import type { Metadata } from 'next';

import { MENTOR_REVIEWS_NAV } from '@/components/app/navigation/portal-nav.config';
import { SubmissionQueueTable } from '@/components/app/submissions/SubmissionQueueTable';
import { Header } from '@/components/layout/Header';
import { H1, P } from '@/components/ui/Typography';

export const metadata: Metadata = {
  title: 'Submission Queue & Reviews | Mentor Portal',
  description: 'Review and grade coursework submitted by your assigned mentees.',
};

export default function MentorSubmissionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...MENTOR_REVIEWS_NAV} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <H1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Submission Queue & Reviews
          </H1>
          <P className="mt-1 text-sm text-slate-500">
            Review submitted coursework, give marks and feedback, or request revisions (FR-10.1 -
            FR-10.7).
          </P>
        </div>

        <SubmissionQueueTable />
      </main>
    </div>
  );
}
