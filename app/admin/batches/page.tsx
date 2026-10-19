import type { Metadata } from 'next';

import { BatchesTable } from '@/components/app/batches/BatchesTable';

export const metadata: Metadata = {
  title: 'Batches Management | Techeniac LMS',
  description:
    'Manage cohorts, member rosters, allocated courses, and lifecycle status transitions.',
};

export default function AdminBatchesPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <BatchesTable />
      </div>
    </div>
  );
}
