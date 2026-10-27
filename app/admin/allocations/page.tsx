import type { Metadata } from 'next';

import { AllocationsTable } from '@/components/app/allocations/AllocationsTable';
import { ADMIN_ALLOCATIONS_NAV } from '@/components/app/navigation/portal-nav.config';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Course Allocations | Admin Console',
  description:
    'Allocate courses to batches and mentees, manage deadlines, and configure overrides.',
};

export default function AdminAllocationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...ADMIN_ALLOCATIONS_NAV} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <AllocationsTable userRole="SUPER_ADMIN" />
      </main>
    </div>
  );
}
