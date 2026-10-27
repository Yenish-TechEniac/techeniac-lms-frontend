'use client';

import Link from 'next/link';
import React from 'react';

import { MENTEE_PORTAL_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { Header } from '@/components/layout/Header';
import { Alert } from '@/components/ui/Alert';
import { H1, H2, H3, P, Span } from '@/components/ui/Typography';
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs font-medium text-slate-400">
        Loading cohort and mentor details...
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

export default function MenteePage() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['MENTEE'] });
  const { data: menteeBatchView, isLoading: isLoadingBatch, error: batchError } = useMenteeBatch();

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading student workspace..."
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
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <Span>Student Portal Active</Span>
              </div>
              <H1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome, {user.name}
              </H1>
              <P variant="muted" className="mt-1 text-sm text-slate-500">
                Track your course progress, complete assignments, and collaborate with your mentor.
              </P>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <Span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Student Account
              </Span>
              <Span className="mt-0.5 block font-bold text-slate-800">{user.role}</Span>
              <Span className="mt-1 block text-slate-500">{user.email}</Span>
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
            <H2 className="text-base font-bold text-slate-900">Your Active Cohort</H2>
            <P variant="muted" className="text-xs text-slate-500">
              One-batch policy: mentees belong to exactly one active training cohort (FR-5.2)
            </P>
          </div>

          <MenteeCohortSection
            isLoading={isLoadingBatch}
            batch={batch}
            mentor={mentor}
            joinedAt={joinedAt}
          />
        </div>

        {/* Learning Tracks / Modules */}
        <div className="mb-6">
          <H2 className="text-base font-bold text-slate-900">Your Learning Tracks</H2>
          <P variant="muted" className="text-xs text-slate-500">
            Enrolled courses, submissions, and milestone tracking
          </P>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Card 1: Course Progress */}
          <Link
            href="/mentee/courses"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                  Curriculum
                </Span>
                <Span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  Active Tracks
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                My Courses & Topics
              </H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Access your allocated curriculum tracks, topic checklists, deadlines, and hands-on
                coding modules.
              </P>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <Span className="text-[11px] font-semibold text-blue-600 group-hover:underline">
                View Enrolled Courses →
              </Span>
              <Span className="text-xs text-slate-400">M7 Allocation</Span>
            </div>
          </Link>

          {/* Card 2: Assignments & Deadlines */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Tasks
                </Span>
                <Span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Module 4
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900">Assignments & Due Dates</H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Submit assignment deliverables, review mentor feedback, and track your submission
                history.
              </P>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Span className="text-[11px] text-slate-400">No active assignment deadlines</Span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
