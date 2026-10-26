'use client';

import Link from 'next/link';
import React from 'react';

import { MENTOR_PORTAL_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { Header } from '@/components/layout/Header';
import { Alert } from '@/components/ui/Alert';
import { H1, H2, H3, P, Span } from '@/components/ui/Typography';
import { useMentorBatches, useMentorMentees } from '@/hooks/useBatches';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import type { ApiBatchSummary } from '@/services/batches.service';

function getBatchStatusBadgeClass(status: string): string {
  switch (status) {
    case 'LIVE':
      return 'bg-emerald-100 text-emerald-800';
    case 'DRAFT':
      return 'bg-blue-100 text-blue-800';
    case 'ON_HOLD':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-slate-200 text-slate-700';
  }
}

function MentorBatchesTable({
  isLoading,
  batches,
}: Readonly<{
  isLoading: boolean;
  batches: ApiBatchSummary[];
}>) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs font-medium text-slate-400">
        Loading assigned cohorts...
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="p-8 text-center">
        <P className="text-sm font-semibold text-slate-700">No Cohorts Assigned</P>
        <P className="mt-1 text-xs text-slate-500">
          You are not currently assigned to any cohorts. An administrator will assign you to an
          upcoming batch.
        </P>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          <tr>
            <th className="px-6 py-3">
              <Span>Batch Name</Span>
            </th>
            <th className="px-4 py-3">
              <Span>Code</Span>
            </th>
            <th className="px-4 py-3">
              <Span>Status</Span>
            </th>
            <th className="px-4 py-3">
              <Span>Schedule Window</Span>
            </th>
            <th className="px-6 py-3 text-right">
              <Span>Mentees</Span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {batches.map((batch) => (
            <tr key={batch.id} className="transition-colors hover:bg-slate-50/50">
              <td className="px-6 py-4">
                <P className="font-semibold text-slate-900">{batch.name}</P>
                {batch.description ? (
                  <P className="text-xs text-slate-500">{batch.description}</P>
                ) : null}
              </td>
              <td className="px-4 py-4 font-mono text-xs font-bold text-slate-700">
                <Span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5">
                  {batch.code}
                </Span>
              </td>
              <td className="px-4 py-4">
                <Span
                  className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase ${getBatchStatusBadgeClass(
                    batch.status,
                  )}`}
                >
                  {batch.status}
                </Span>
              </td>
              <td className="px-4 py-4 font-mono text-xs text-slate-600">
                <Span>
                  {batch.startDate} → {batch.endDate}
                </Span>
              </td>
              <td className="px-6 py-4 text-right font-mono text-xs font-bold text-slate-800">
                <Span>{batch.menteesCount ?? 0}</Span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MentorMenteesTable({
  isLoading,
  mentees,
}: Readonly<{
  isLoading: boolean;
  mentees: Array<{
    id: string;
    name?: string;
    email?: string;
    batchName?: string;
    batchCode?: string;
    startDate?: string;
  }>;
}>) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs font-medium text-slate-400">
        Loading mapped mentees...
      </div>
    );
  }

  if (mentees.length === 0) {
    return (
      <div className="p-8 text-center">
        <P className="text-sm font-semibold text-slate-700">No Mentees Mapped</P>
        <P className="mt-1 text-xs text-slate-500">
          You do not currently have any mentees mapped to you. Mentees will appear here once mapped
          by administrators.
        </P>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          <tr>
            <th className="px-6 py-3">
              <Span>Mentee</Span>
            </th>
            <th className="px-4 py-3">
              <Span>Cohort</Span>
            </th>
            <th className="px-4 py-3">
              <Span>Cohort Code</Span>
            </th>
            <th className="px-6 py-3 text-right">
              <Span>Mapped Since</Span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {mentees.map((mentee) => (
            <tr key={mentee.id} className="transition-colors hover:bg-slate-50/50">
              <td className="px-6 py-4">
                <P className="font-semibold text-slate-900">{mentee.name ?? 'Assigned Mentee'}</P>
                <P className="font-mono text-xs text-slate-500">{mentee.email ?? '—'}</P>
              </td>
              <td className="px-4 py-4 text-xs font-medium text-slate-800">
                <Span>{mentee.batchName ?? 'Batch'}</Span>
              </td>
              <td className="px-4 py-4 font-mono text-xs text-slate-600">
                <Span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5">
                  {mentee.batchCode ?? '—'}
                </Span>
              </td>
              <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">
                <Span>{mentee.startDate?.slice(0, 10) ?? '—'}</Span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MentorPage() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['MENTOR'] });

  const {
    data: batches = [],
    isLoading: isLoadingBatches,
    error: batchesError,
  } = useMentorBatches();

  const {
    data: mentees = [],
    isLoading: isLoadingMentees,
    error: menteesError,
  } = useMentorMentees();

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading mentor workspace..."
        spinnerColor="border-emerald-600"
      />
    );
  }

  const liveBatchesCount = batches.filter((b) => b.status === 'LIVE').length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...MENTOR_PORTAL_NAV} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <Span>Mentor Workspace Active</Span>
              </div>
              <H1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome, {user.name}
              </H1>
              <P variant="muted" className="mt-1 text-sm text-slate-500">
                Guide your mentees, review progress, and manage assigned cohorts.
              </P>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <Span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Assigned Role
              </Span>
              <Span className="mt-0.5 block font-bold text-slate-800">{user.role}</Span>
              <Span className="mt-1 block text-slate-500">{user.email}</Span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {batchesError || menteesError ? (
          <div className="mb-6">
            <Alert
              variant="error"
              title="Error Loading Cohort Data"
              message={
                batchesError?.message ||
                menteesError?.message ||
                'An error occurred while fetching your assigned cohort information.'
              }
            />
          </div>
        ) : null}

        {/* Metric Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <Span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              Assigned Cohorts
            </Span>
            <P className="mt-1 font-mono text-3xl font-bold text-slate-900">
              {isLoadingBatches ? '—' : batches.length}
            </P>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <Span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              Mapped Mentees
            </Span>
            <P className="mt-1 font-mono text-3xl font-bold text-slate-900">
              {isLoadingMentees ? '—' : mentees.length}
            </P>
          </div>
          <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-1">
            <Span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
              Live Cohorts
            </Span>
            <P className="mt-1 font-mono text-3xl font-bold text-emerald-600">
              {isLoadingBatches ? '—' : liveBatchesCount}
            </P>
          </div>
        </div>

        {/* Section 1: Assigned Batches */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="border-b border-slate-100 p-5">
            <H2 className="text-base font-bold text-slate-900">Assigned Cohorts</H2>
            <P variant="muted" className="text-xs text-slate-500">
              Cohorts you are currently facilitating as an active mentor (FR-4.1)
            </P>
          </div>

          <MentorBatchesTable isLoading={isLoadingBatches} batches={batches} />
        </div>

        {/* Section 2: Mapped Mentees */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="border-b border-slate-100 p-5">
            <H2 className="text-base font-bold text-slate-900">Your Mapped Mentees</H2>
            <P variant="muted" className="text-xs text-slate-500">
              Students assigned directly to your mentorship across your cohorts (FR-4.2 - 4.3)
            </P>
          </div>

          <MentorMenteesTable isLoading={isLoadingMentees} mentees={mentees} />
        </div>

        {/* Action Areas / Upcoming Modules */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Card 1: Submission Reviews */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Grading Queue
                </Span>
                <Span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Module 4
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900">Assignment Reviews</H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Review code submissions, provide feedback, request resubmissions, and mark grades.
              </P>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Span className="text-[11px] text-slate-400">Zero pending reviews</Span>
            </div>
          </div>

          {/* Card 3: Curriculum & Course Library */}
          <Link
            href="/mentor/courses"
            className="group flex flex-col justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                  Courses
                </Span>
                <Span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Active
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                Course Library & Builder
              </H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Course syllabi, outline builder, subtopic lessons, embedded assignments, and live
                saves.
              </P>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-100 pt-3">
              <Span className="text-[11px] font-semibold text-emerald-700 group-hover:underline">
                Manage Courses &rarr;
              </Span>
              <Span className="text-[10px] font-medium text-emerald-600">Syllabus Builder</Span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
