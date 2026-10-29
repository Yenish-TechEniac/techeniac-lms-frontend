'use client';

import React from 'react';

import { MENTOR_MY_PERFORMANCE_NAV } from '@/components/app/navigation/portal-nav.config';
import { LearningHistoryView } from '@/components/app/performance';
import { Header } from '@/components/layout/Header';
import { H1, P } from '@/components/ui/Typography';
import { useLearningHistoryQuery } from '@/hooks/usePerformance';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function MentorMyPerformancePage() {
  useRoleGuard('MENTOR');

  const { data: history, isLoading, isError, error, refetch } = useLearningHistoryQuery();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...MENTOR_MY_PERFORMANCE_NAV} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <H1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Performance (Past Learning History)
          </H1>
          <P className="mt-1 text-sm text-slate-500">
            View historical batch enrollments, course allocations, grades, and mentor feedback from
            your time as a mentee (FR-11.5).
          </P>
        </div>

        <LearningHistoryView
          history={history}
          isLoading={isLoading}
          isMentorPastView={true}
          isError={isError}
          error={error}
          onRetry={() => void refetch()}
        />
      </main>
    </div>
  );
}
