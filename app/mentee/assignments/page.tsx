'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';

import { MENTEE_ASSIGNMENTS_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { MyAssignmentsTable } from '@/components/app/submissions/MyAssignmentsTable';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { H1, P, Span } from '@/components/ui/Typography';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { useMyAssignments } from '@/hooks/useSubmissions';
import type { AssignmentDerivedStatus } from '@/types/submissions';

function MenteeAssignmentsContent() {
  const router = useRouter();
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['MENTEE'] });
  const searchParams = useSearchParams();
  const activeCourseId = searchParams.get('courseId') ?? undefined;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<AssignmentDerivedStatus | undefined>(
    undefined,
  );

  const { assignments, total, totalPages, isLoading, error, refetch } = useMyAssignments({
    page,
    limit,
    status: selectedStatus,
    courseId: activeCourseId,
  });

  const handleStatusChange = (status?: AssignmentDerivedStatus) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleClearCourseFilter = () => {
    setPage(1);
    router.replace('/mentee/assignments', { scroll: false });
  };

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading student assignments..."
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...MENTEE_ASSIGNMENTS_NAV} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <Span>Assignments Portal</Span>
              </div>
              <H1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Course Assignments
              </H1>
              <P variant="muted" className="mt-1 text-sm text-slate-500">
                Submit assignment deliverables, review mentor grades, and inspect revision history
                in Indian Standard Time (IST).
              </P>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <Span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Timezone Standard
              </Span>
              <Span className="mt-0.5 block font-bold text-slate-800">IST (UTC+05:30)</Span>
              <Span className="mt-1 block text-slate-500">All due dates shown in IST</Span>
            </div>
          </div>

          {activeCourseId ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <Span className="text-xs text-slate-500">Filtered by course:</Span>
              <Span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">
                {assignments[0]?.courseTitle ?? activeCourseId}
              </Span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCourseFilter}
                className="h-6 px-2 text-[11px]"
              >
                Clear Course Filter
              </Button>
            </div>
          ) : null}
        </div>

        {/* Assignments Table & Filters */}
        <MyAssignmentsTable
          assignments={assignments}
          isLoading={isLoading}
          error={error}
          onRetry={() => {
            void refetch();
          }}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          pagination={{
            page,
            limit,
            total,
            totalPages,
            onPageChange: setPage,
            onLimitChange: (newLimit) => {
              setLimit(newLimit);
              setPage(1);
            },
          }}
        />
      </main>
    </div>
  );
}

export default function MenteeAssignmentsPage() {
  return (
    <Suspense
      fallback={
        <PortalSessionState sessionError={null} loadingMessage="Loading student assignments..." />
      }
    >
      <MenteeAssignmentsContent />
    </Suspense>
  );
}
