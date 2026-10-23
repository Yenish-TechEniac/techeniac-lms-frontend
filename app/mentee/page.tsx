'use client';

import React from 'react';

import { MENTEE_PORTAL_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { Header } from '@/components/layout/Header';
import { H1, H2, H3, P, Span } from '@/components/ui/Typography';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function MenteePage() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['MENTEE'] });

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading student workspace..."
      />
    );
  }

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

        {/* Mentee Overview Cards */}
        <div className="mb-6">
          <H2 className="text-base font-bold text-slate-900">Your Learning Tracks</H2>
          <P variant="muted" className="text-xs text-slate-500">
            Enrolled courses, submissions, and mentor support
          </P>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: My Cohort */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                  Batch & Mentor
                </Span>
                <Span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  Module 2
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900">Assigned Cohort</H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                You will be assigned to a cohort and paired with an expert mentor when Module 2 is
                active.
              </P>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Span className="text-[11px] text-slate-400">Enrollment pending batch launch</Span>
            </div>
          </div>

          {/* Card 2: Course Progress */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Curriculum
                </Span>
                <Span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Module 3
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900">Courses & Topics</H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Access structured learning modules, topic checklists, and hands-on coding exercises.
              </P>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Span className="text-[11px] text-slate-400">Courses upcoming</Span>
            </div>
          </div>

          {/* Card 3: Assignments */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Assignments
                </Span>
                <Span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Module 4
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900">Tasks & Submissions</H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Submit assignments for code review and receive direct feedback from your mentor.
              </P>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Span className="text-[11px] text-slate-400">No pending submissions</Span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
