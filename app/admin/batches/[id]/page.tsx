import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import {
  BatchDashboardView,
  type BatchDetailData,
} from '@/components/app/batches/BatchDashboardView';
import { ADMIN_BATCHES_NAV } from '@/components/app/navigation/portal-nav.config';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Batch Dashboard | Techeniac LMS',
  description: 'Detailed overview of batch members, course progress, and status timeline.',
};

async function BatchDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const mockBatch: BatchDetailData = {
    id,
    name: 'Frontend Engineering 2025 Q1',
    code: 'FE-25Q1',
    status: 'LIVE',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    description:
      'Comprehensive core track covering TypeScript, Next.js, and modern distributed architecture.',
    members: [
      {
        id: 'usr-2',
        name: 'Alex Chen',
        email: 'alex.chen@enterprise.internal',
        memberRole: 'MENTOR',
        joinedAt: '2025-01-15',
      },
      {
        id: 'usr-3',
        name: 'Priya Patel',
        email: 'priya.patel@enterprise.internal',
        memberRole: 'MENTEE',
        mappedToName: 'Alex Chen',
        joinedAt: '2025-01-15',
      },
      {
        id: 'usr-4',
        name: 'Marcus Brody',
        email: 'marcus.brody@enterprise.internal',
        memberRole: 'MENTEE',
        mappedToName: 'Alex Chen',
        joinedAt: '2025-01-16',
      },
    ],
    courses: [
      {
        id: 'crs-1',
        title: 'Git & GitHub Workflow Mastery',
        dueDate: '2025-02-28',
        averageProgress: 85,
        status: 'IN_PROGRESS',
      },
      {
        id: 'crs-2',
        title: 'Distributed Systems & Microservices',
        dueDate: '2025-04-30',
        averageProgress: 40,
        status: 'IN_PROGRESS',
      },
    ],
    history: [
      {
        id: 'h-1',
        fromStatus: 'DRAFT',
        toStatus: 'LIVE',
        changedBy: 'Devon Vance (Super Admin)',
        changedAt: '2025-01-15 09:00 UTC',
        reason: 'Members and course allocations verified. Initiated cohort.',
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...ADMIN_BATCHES_NAV} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <BatchDashboardView initialBatch={mockBatch} />
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
