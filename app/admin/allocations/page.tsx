import type { Metadata } from 'next';

import { AllocationsTable } from '@/components/app/allocations/AllocationsTable';
import { ADMIN_ALLOCATIONS_NAV } from '@/components/app/navigation/portal-nav.config';
import { DashboardContent } from '@/components/layout/DashboardContent';
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
      <DashboardContent>
        <AllocationsTable userRole="SUPER_ADMIN" />
      </DashboardContent>
    </div>
  );
}
