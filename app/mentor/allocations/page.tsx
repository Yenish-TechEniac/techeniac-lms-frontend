import type { Metadata } from 'next';

import { AllocationsTable } from '@/components/app/allocations/AllocationsTable';
import { MENTOR_ALLOCATIONS_NAV } from '@/components/app/navigation/portal-nav.config';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Course Allocations | Mentor Portal',
  description: 'Manage allocated courses and deadlines for mentees in your batches.',
};

export default function MentorAllocationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...MENTOR_ALLOCATIONS_NAV} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <AllocationsTable userRole="MENTOR" />
      </main>
    </div>
  );
}
