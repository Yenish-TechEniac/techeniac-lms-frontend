import type { Metadata } from 'next';

import { AllocationsTable } from '@/components/app/allocations/AllocationsTable';
import { MENTOR_ALLOCATIONS_NAV } from '@/components/app/navigation/portal-nav.config';
import { DashboardContent } from '@/components/layout/DashboardContent';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Course Allocations | Mentor Portal',
  description: 'Manage allocated courses and deadlines for mentees in your batches.',
};

export default function MentorAllocationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...MENTOR_ALLOCATIONS_NAV} />
      <DashboardContent>
        <AllocationsTable userRole="MENTOR" />
      </DashboardContent>
    </div>
  );
}
