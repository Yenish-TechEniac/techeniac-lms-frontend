import type { Metadata } from 'next';

import { BatchesTable } from '@/components/app/batches/BatchesTable';
import { ADMIN_BATCHES_NAV } from '@/components/app/navigation/portal-nav.config';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Batches Management | Techeniac LMS',
  description:
    'Manage cohorts, member rosters, allocated courses, and lifecycle status transitions.',
};

export default function AdminBatchesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...ADMIN_BATCHES_NAV} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <BatchesTable />
      </main>
    </div>
  );
}
