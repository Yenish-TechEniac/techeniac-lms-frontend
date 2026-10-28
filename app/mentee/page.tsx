'use client';

import Link from 'next/link';
import React, { useMemo } from 'react';

import { MENTEE_PORTAL_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { DashboardContent } from '@/components/layout/DashboardContent';
import { Header } from '@/components/layout/Header';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { H1, H2, H3, P, Span } from '@/components/ui/Typography';
import {
  type CourseAllocation,
  isTerminalAllocationStatus,
  useAllocationsList,
} from '@/hooks/useAllocations';
import { useMenteeBatch } from '@/hooks/useBatches';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import type { ApiBatchSummary } from '@/services/batches.service';

function formatDate(dateInput?: string | null): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

function formatDateRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate && !endDate) return '—';
  if (startDate && endDate) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }
  return formatDate(startDate || endDate);
}

function MenteeHeaderSection({
  userName,
  userEmail,
  isLoading,
  batch,
  mentor,
}: Readonly<{
  userName: string;
  userEmail: string;
  isLoading: boolean;
  batch?: ApiBatchSummary | null | undefined;
  mentor?: { id: string; name: string; email: string } | null | undefined;
}>) {
  if (isLoading) {
    return (
      <div className="mb-8 rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-44" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-20 w-56 rounded-xl" />
            <Skeleton className="h-20 w-56 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <H1 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
            Welcome, {userName}
          </H1>
          <P className="mt-1 text-sm font-medium text-[#667085]">{userEmail}</P>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Batch Box */}
          <div className="min-w-56 rounded-xl border border-[#E1E6EC] bg-[#F6F8FC] p-4">
            <Span className="block text-xs font-bold tracking-wider text-[#667085] uppercase">
              Batch
            </Span>
            <Span className="mt-1 block text-base font-bold text-[#111827]">
              {batch?.name ?? 'No Active Batch'}
            </Span>
            {batch ? (
              <Span className="mt-1 block text-xs font-semibold text-[#0044D3]">
                {formatDateRange(batch.startDate, batch.endDate)}
              </Span>
            ) : null}
          </div>

          {/* Mentor Box */}
          <div className="min-w-56 rounded-xl border border-[#E1E6EC] bg-[#F6F8FC] p-4">
            <Span className="block text-xs font-bold tracking-wider text-[#667085] uppercase">
              Mentor
            </Span>
            <Span className="mt-1 block text-base font-bold text-[#111827]">
              {mentor?.name ?? 'Not Assigned'}
            </Span>
            {mentor?.email ? (
              <Span className="mt-1 block text-xs text-[#667085]">{mentor.email}</Span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenteeProgressOverviewCard({
  isLoading,
  allocations,
}: Readonly<{
  isLoading: boolean;
  allocations: readonly CourseAllocation[];
}>) {
  if (isLoading) {
    return (
      <div className="w-full space-y-4 rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs sm:p-8">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-[#E1E6EC] bg-white p-8 text-center shadow-xs">
        <P className="text-base font-semibold text-[#111827]">No Course Allocations Yet</P>
        <P className="mt-1 text-sm text-[#667085]">
          You are not currently enrolled in any curriculum tracks.
        </P>
      </div>
    );
  }

  const active = allocations.filter((a) => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS');
  const completed = allocations.filter((a) => a.status === 'COMPLETED').length;
  const overdue = allocations.filter((a) => {
    const isClosed = isTerminalAllocationStatus(a.status) && a.status !== 'COMPLETED';
    return Boolean(a.isOverdue) && a.status !== 'COMPLETED' && !isClosed;
  }).length;

  const totalProgress = allocations.reduce((sum, a) => sum + Number(a.progressPercent || 0), 0);
  const averagePace = Math.round((totalProgress / allocations.length) * 10) / 10;

  return (
    <div className="w-full rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Span className="text-xs font-bold tracking-wider text-[#0044D3] uppercase">
            Curriculum Completion
          </Span>
          <div className="mt-2 flex items-baseline gap-3">
            <H3 className="text-4xl font-extrabold text-[#111827]">{averagePace}%</H3>
            <Span className="text-sm font-medium text-[#667085]">Average Progress</Span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <Span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <Span>{completed} Completed</Span>
          </div>
          <Span className="text-[#E1E6EC]">•</Span>
          <div className="flex items-center gap-1.5 text-[#0044D3]">
            <Span className="h-2.5 w-2.5 rounded-full bg-[#0044D3]" />
            <Span>{active.length} In Progress</Span>
          </div>
          {overdue > 0 && (
            <>
              <Span className="text-[#E1E6EC]">•</Span>
              <div className="flex items-center gap-1.5 text-rose-600">
                <Span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <Span>{overdue} Overdue</Span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full-width Progress Bar */}
      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-[#F6F8FC]">
        <div
          className="h-full rounded-full bg-[#0044D3] transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, averagePace))}%` }}
        />
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex items-center justify-between border-t border-[#E1E6EC] pt-4">
        <Span className="text-base font-semibold text-[#667085]">
          Total Assigned Courses:{' '}
          <strong className="text-xl font-bold text-[#111827]">{allocations.length}</strong>
        </Span>
      </div>
    </div>
  );
}

export default function MenteePage() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['MENTEE'] });
  const { data: menteeBatchView, isLoading: isLoadingBatch, error: batchError } = useMenteeBatch();
  const { data: allocationsData, isLoading: isLoadingAllocations } = useAllocationsList({
    menteeId: user?.id,
    limit: 100,
  });

  const allocations = useMemo<readonly CourseAllocation[]>(
    () => allocationsData?.items ?? [],
    [allocationsData],
  );

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading student workspace..."
        variant="mentee"
      />
    );
  }

  const batch = menteeBatchView?.batch;
  const mentor = menteeBatchView?.mentor;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...MENTEE_PORTAL_NAV} />

      <DashboardContent>
        {/* Minimal Top Section: Welcome, Mentor & Batch */}
        <MenteeHeaderSection
          userName={user.name}
          userEmail={user.email}
          isLoading={isLoadingBatch}
          batch={batch}
          mentor={mentor}
        />

        {/* Global Error Banner */}
        {batchError ? (
          <div className="mb-6">
            <Alert
              variant="error"
              title="Error Loading Cohort Enrollment"
              message={
                batchError.message ||
                'An error occurred while fetching your active cohort assignment.'
              }
            />
          </div>
        ) : null}

        {/* Full-Width Learning Progress Section */}
        <div className="mb-8">
          <div className="mb-4">
            <H2 className="text-xl font-bold text-[#111827]">Learning Progress</H2>
          </div>

          <MenteeProgressOverviewCard isLoading={isLoadingAllocations} allocations={allocations} />
        </div>

        {/* Quick Access: My Courses & My Assignments */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Card 1: My Courses */}
          <Link
            href="/mentee/courses"
            className="group flex flex-col justify-between rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs transition-all duration-200 hover:border-[#0044D3] hover:bg-white hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0044D3] transition-colors group-hover:bg-[#0044D3] group-hover:text-white">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <svg
                  className="h-5 w-5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#0044D3]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <H3 className="mt-4 text-lg font-bold text-[#111827] transition-colors group-hover:text-[#0044D3]">
                My Courses
              </H3>
              <P className="mt-1 text-sm text-[#667085]">
                View curriculum modules, lesson materials, and syllabus milestones.
              </P>
            </div>
          </Link>

          {/* Card 2: My Assignments */}
          <Link
            href="/mentee/assignments"
            className="group flex flex-col justify-between rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs transition-all duration-200 hover:border-[#0044D3] hover:bg-white hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700 transition-colors group-hover:bg-purple-700 group-hover:text-white">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <svg
                  className="h-5 w-5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-purple-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <H3 className="mt-4 text-lg font-bold text-[#111827] transition-colors group-hover:text-[#0044D3]">
                My Assignments
              </H3>
              <P className="mt-1 text-sm text-[#667085]">
                Submit homework tasks, check code evaluations, and view mentor feedback.
              </P>
            </div>
          </Link>
        </div>
      </DashboardContent>
    </div>
  );
}
