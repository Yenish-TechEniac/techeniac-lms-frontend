'use client';

import Link from 'next/link';
import React, { use } from 'react';

import { MENTEE_ASSIGNMENTS_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { AssignmentSubmissionForm } from '@/components/app/submissions/AssignmentSubmissionForm';
import { SubmissionVersionHistory } from '@/components/app/submissions/SubmissionVersionHistory';
import { Header } from '@/components/layout/Header';
import { Alert } from '@/components/ui/Alert';
import { Code, H1, H2, H3, P, Span } from '@/components/ui/Typography';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { useAssignmentSubmissionDetails } from '@/hooks/useSubmissions';
import { formatDateTimeIST } from '@/lib/date';
import type { ResourceItem } from '@/types/courses';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MenteeAssignmentDetailPage({ params }: Readonly<PageProps>) {
  const { id } = use(params);
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['MENTEE'] });

  const { assignment, allocation, versions, isLoading, error, refetch } =
    useAssignmentSubmissionDetails(id);

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading assignment workspace..."
      />
    );
  }

  const latestVersion = versions.length > 0 ? versions[0] : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...MENTEE_ASSIGNMENTS_NAV} />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/mentee/assignments" className="font-medium hover:text-blue-600">
            ← Back to All Assignments
          </Link>
          <span>/</span>
          <Span className="truncate font-semibold text-slate-800">
            {assignment?.title ?? 'Assignment Workspace'}
          </Span>
        </div>

        {error ? <Alert variant="error" title="Failed to load assignment" message={error} /> : null}

        {isLoading || !assignment || !allocation ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
            <P className="mt-3 text-xs text-slate-500">
              Loading assignment details and submission history...
            </P>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Assignment Overview Card */}
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      {assignment.scope} Scope
                    </Span>
                    {assignment.topicId ? (
                      <Span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        Topic Assignment
                      </Span>
                    ) : null}
                  </div>
                  <H1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {assignment.title}
                  </H1>
                  <P className="text-xs text-slate-500">
                    Course: <strong className="text-slate-700">{assignment.courseId}</strong>
                  </P>
                </div>

                {/* Deadlines & IST Details Card */}
                <div className="min-w-[260px] space-y-2 rounded-xl border border-slate-100 bg-slate-50/75 p-4 text-xs">
                  <div>
                    <Span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Due Date (IST Standard)
                    </Span>
                    <Span className="mt-0.5 block text-sm font-bold text-slate-900">
                      {formatDateTimeIST(allocation.dueDate)}
                    </Span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-slate-600">
                    <span>Estimated Time:</span>
                    <strong className="text-slate-800">{assignment.estimatedMinutes} mins</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Max Marks:</span>
                    <Code className="text-slate-800">{assignment.maxMarks}</Code>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Late Submissions:</span>
                    <Span
                      className={
                        assignment.allowLate
                          ? 'font-semibold text-emerald-600'
                          : 'font-semibold text-rose-600'
                      }
                    >
                      {assignment.allowLate ? 'Allowed' : 'Blocked'}
                    </Span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {assignment.instructions ? (
                <div className="space-y-2">
                  <H2 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                    Instructions & Guidelines
                  </H2>
                  <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                    {assignment.instructions}
                  </div>
                </div>
              ) : null}

              {/* Attached Resources */}
              {Array.isArray(assignment.resources) && assignment.resources.length > 0 ? (
                <div className="space-y-2">
                  <H3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Reference Resources
                  </H3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {assignment.resources.map((res: ResourceItem, index: number) => (
                      <a
                        key={res.id ?? index}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs transition-all hover:border-blue-400 hover:bg-blue-50/30"
                      >
                        <Span className="mr-2 truncate font-semibold text-slate-800">
                          {res.title}
                        </Span>
                        <Span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                          {res.type} ↗
                        </Span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Submission Form Component */}
            <AssignmentSubmissionForm
              assignment={assignment}
              dueDate={allocation.dueDate}
              isBatchActive={allocation.isBatchActive}
              batchStatus={allocation.batchStatus}
              latestVersion={latestVersion}
              onSuccess={() => {
                void refetch();
              }}
            />

            {/* Submission Version History */}
            <SubmissionVersionHistory versions={versions} maxMarks={assignment.maxMarks} />
          </div>
        )}
      </main>
    </div>
  );
}
