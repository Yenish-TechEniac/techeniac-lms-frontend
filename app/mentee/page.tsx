'use client';

import Link from 'next/link';
import React, { useMemo } from 'react';

import { AllocationStatusBadge } from '@/components/app/allocations/AllocationStatusBadge';
import { MENTEE_PORTAL_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { Header } from '@/components/layout/Header';
import { Alert } from '@/components/ui/Alert';
import { getButtonClassName } from '@/components/ui/Button';
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

function getBatchStatusBadgeClass(status: string): string {
  switch (status) {
    case 'LIVE':
      return 'bg-emerald-100 text-emerald-800';
    case 'DRAFT':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-slate-200 text-slate-700';
  }
}

function MenteeBatchCard({
  batch,
  joinedAt,
}: Readonly<{
  batch: ApiBatchSummary;
  joinedAt?: string | null | undefined;
}>) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div>
        <div className="flex items-center justify-between">
          <Span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
            Current Cohort
          </Span>
          <Span
            className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase ${getBatchStatusBadgeClass(
              batch.status,
            )}`}
          >
            {batch.status}
          </Span>
        </div>
        <H3 className="mt-3 text-xl font-bold text-slate-900">{batch.name}</H3>
        <Span className="mt-1 inline-block rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
          {batch.code}
        </Span>
        {batch.description ? (
          <P className="mt-2 text-xs leading-relaxed text-slate-600">{batch.description}</P>
        ) : null}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4 text-xs">
        <div className="flex items-center justify-between text-slate-500">
          <Span>Timeline Window:</Span>
          <Span className="font-mono font-semibold text-slate-800">
            {batch.startDate} → {batch.endDate}
          </Span>
        </div>
        {joinedAt ? (
          <div className="mt-2 flex items-center justify-between text-slate-500">
            <Span>Enrolled Date:</Span>
            <Span className="font-mono font-semibold text-slate-800">{joinedAt.slice(0, 10)}</Span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MenteeMentorCard({
  mentor,
}: Readonly<{
  mentor: { id: string; name: string; email: string } | null | undefined;
}>) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div>
        <div className="flex items-center justify-between">
          <Span className="text-[10px] font-bold tracking-wider text-purple-700 uppercase">
            Dedicated Mentor
          </Span>
          <Span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
            1-on-1 Guidance
          </Span>
        </div>
        {mentor ? (
          <>
            <H3 className="mt-3 text-xl font-bold text-slate-900">{mentor.name}</H3>
            <P className="mt-1 font-mono text-xs text-slate-500">{mentor.email}</P>
            <P className="mt-3 text-xs leading-relaxed text-slate-600">
              Your assigned mentor will guide your coursework, perform code reviews on your
              assignment submissions, and track your milestone completions.
            </P>
          </>
        ) : (
          <>
            <H3 className="mt-3 text-lg font-bold text-slate-700">Mentor Assignment in Progress</H3>
            <P className="mt-2 text-xs leading-relaxed text-slate-500">
              You have been enrolled in this cohort! Your dedicated mentor will be assigned shortly
              by an administrator.
            </P>
          </>
        )}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4 text-xs">
        <div className="flex items-center justify-between text-slate-500">
          <Span>Mentorship Status:</Span>
          <Span className={`font-semibold ${mentor ? 'text-emerald-700' : 'text-amber-700'}`}>
            {mentor ? 'Active Guidance' : 'Pending Mentor Assignment'}
          </Span>
        </div>
      </div>
    </div>
  );
}

function MenteeCohortSection({
  isLoading,
  batch,
  mentor,
  joinedAt,
}: Readonly<{
  isLoading: boolean;
  batch?: ApiBatchSummary | null | undefined;
  mentor?: { id: string; name: string; email: string } | null | undefined;
  joinedAt?: string | null | undefined;
}>) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-4 rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <P className="text-sm font-semibold text-slate-800">Not Enrolled in an Active Batch</P>
        <P className="mt-1 text-xs text-slate-500">
          You are not currently enrolled in any active cohort. Please contact your administrator or
          program manager to receive your batch assignment.
        </P>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <MenteeBatchCard batch={batch} joinedAt={joinedAt} />
      <MenteeMentorCard mentor={mentor} />
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
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-4 rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xs">
        <P className="text-sm font-semibold text-slate-800">No Course Allocations Yet</P>
        <P className="mt-1 text-xs text-slate-500">
          You are not currently enrolled in any curriculum tracks. Once courses are assigned by your
          mentor or administrator, your progress will appear here.
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
  const spotlight = active[0] ?? allocations[0];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* Overall Pace Card */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center justify-between">
            <Span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
              Overall Progress
            </Span>
            <Span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700">
              {allocations.length} {allocations.length === 1 ? 'Track' : 'Tracks'}
            </Span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <H3 className="text-3xl font-extrabold text-slate-900">{averagePace}%</H3>
            <Span className="text-xs text-slate-500">average pace</Span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, averagePace))}%` }}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
          <div className="flex items-center gap-3">
            <Span className="font-semibold text-emerald-700">{completed} Done</Span>
            <Span className="text-slate-300">•</Span>
            <Span className="font-semibold text-blue-700">{active.length} Active</Span>
            {overdue > 0 && (
              <>
                <Span className="text-slate-300">•</Span>
                <Span className="font-semibold text-rose-600">{overdue} Overdue</Span>
              </>
            )}
          </div>
          <Link href="/mentee/progress" className="font-semibold text-blue-600 hover:underline">
            All Tracks →
          </Link>
        </div>
      </div>

      {/* Spotlight Active Track */}
      {spotlight && (
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <Span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {spotlight.batch?.name ?? 'Current Track'}
              </Span>
              <AllocationStatusBadge
                status={spotlight.status}
                isOverdue={Boolean(spotlight.isOverdue) && spotlight.status !== 'COMPLETED'}
              />
            </div>
            <H3 className="mt-3 text-lg font-bold text-slate-900">
              {spotlight.course?.title ?? 'Enrolled Course'}
            </H3>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                <Span className="text-slate-600">Course Pace</Span>
                <Span className="font-mono text-blue-600">{spotlight.progressPercent}%</Span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, spotlight.progressPercent))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
            <Span className="font-mono text-slate-500">
              Due {new Date(spotlight.dueDate).toLocaleDateString()}
            </Span>
            <Link
              href={`/mentee/courses/${spotlight.id}`}
              className={getButtonClassName('primary', 'sm')}
            >
              {spotlight.status === 'COMPLETED' ? 'Review Course →' : 'Continue Course →'}
            </Link>
          </div>
        </div>
      )}
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
  const joinedAt = menteeBatchView?.joinedAt;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...MENTEE_PORTAL_NAV} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 rounded-2xl border border-[#E1E6EC] bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <H1 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                Welcome, {user.name}
              </H1>
              <P className="mt-2 text-base text-[#667085]">
                Track your course progress, complete assignments, and collaborate with your mentor.
              </P>
            </div>

            <div className="rounded-2xl border border-[#E1E6EC] bg-[#F6F8FC] p-4 text-xs sm:min-w-64">
              <Span className="block text-xs font-bold tracking-wider text-[#667085] uppercase">
                Student Account
              </Span>
              <Span className="mt-1 block text-base font-bold text-[#111827]">{user.role}</Span>
              <Span className="mt-0.5 block text-sm text-[#667085]">{user.email}</Span>
            </div>
          </div>
        </div>

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

        {/* Active Cohort & Mentor Section */}
        <div className="mb-8">
          <div className="mb-4">
            <H2 className="text-base font-bold text-[#111827]">Your Active Cohort</H2>
            <P className="mt-0.5 text-xs text-[#667085]">
              One-batch policy: mentees belong to exactly one active training cohort
            </P>
          </div>

          <MenteeCohortSection
            isLoading={isLoadingBatch}
            batch={batch}
            mentor={mentor}
            joinedAt={joinedAt}
          />
        </div>

        {/* Live Learning Progress Telemetry Section (FR-8.1, FR-8.7) */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <H2 className="text-base font-bold text-[#111827]">Learning Progress</H2>
              <P className="mt-0.5 text-xs text-[#667085]">
                Live curriculum telemetry, milestone deadlines, and syllabus pace
              </P>
            </div>
            {allocations.length > 0 && (
              <Link
                href="/mentee/progress"
                className="text-xs font-semibold text-[#0044D3] hover:underline"
              >
                View Full Telemetry →
              </Link>
            )}
          </div>

          <MenteeProgressOverviewCard isLoading={isLoadingAllocations} allocations={allocations} />
        </div>

        {/* Learning Tracks / Navigation Cards */}
        <div className="mb-6">
          <H2 className="text-xl font-bold text-[#111827]">Student Workspace Tracks</H2>
          <P className="mt-1 text-sm text-[#667085]">
            Quick navigation across enrolled courses and progress tracking
          </P>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Course Progress */}
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
                <span className="text-[#667085] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0044D3]">
                  &rarr;
                </span>
              </div>
              <H3 className="mt-4 text-base font-bold text-[#111827] transition-colors group-hover:text-[#0044D3]">
                My Courses & Topics
              </H3>
              <P className="mt-1.5 text-xs leading-relaxed text-[#667085]">
                Access your allocated curriculum tracks, topic checklists, deadlines, and hands-on
                coding modules.
              </P>
            </div>
          </Link>

          {/* Card 2: Assignments & Deadlines */}
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
                <span className="text-[#667085] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0044D3]">
                  &rarr;
                </span>
              </div>
              <H3 className="mt-4 text-base font-bold text-[#111827] transition-colors group-hover:text-[#0044D3]">
                Assignments & Due Dates
              </H3>
              <P className="mt-1.5 text-xs leading-relaxed text-[#667085]">
                Submit assignment deliverables, review mentor feedback, and track your submission
                history.
              </P>
            </div>
          </Link>

          {/* Card 3: Learning Progress */}
          <Link
            href="/mentee/progress"
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <span className="text-[#667085] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0044D3]">
                  &rarr;
                </span>
              </div>
              <H3 className="mt-4 text-base font-bold text-[#111827] transition-colors group-hover:text-[#0044D3]">
                Learning Progress
              </H3>
              <P className="mt-1.5 text-xs leading-relaxed text-[#667085]">
                Track completed topics, view overdue warnings, and monitor your personal learning
                pace.
              </P>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
