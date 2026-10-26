import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import { BatchDashboardView } from '@/components/app/batches/BatchDashboardView';
import { ADMIN_BATCHES_NAV } from '@/components/app/navigation/portal-nav.config';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Batch Dashboard | Techeniac LMS',
  description: 'Detailed overview of batch members, course progress, and status timeline.',
};

async function BatchDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...ADMIN_BATCHES_NAV} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <BatchDashboardView batchId={id} />
      </main>
    </div>
  );
}

export default function AdminBatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm font-medium text-slate-500">
          Loading batch dashboard...
        </div>
      }
    >
      <BatchDetailContent params={params} />
    </Suspense>
  );
}
