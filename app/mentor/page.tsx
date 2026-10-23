'use client';

import React from 'react';

import { MENTOR_PORTAL_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { Header } from '@/components/layout/Header';
import { H1, H2, H3, P, Span } from '@/components/ui/Typography';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function MentorPage() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['MENTOR'] });

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading mentor workspace..."
        spinnerColor="border-emerald-600"
      />
    );
  }

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
                Guide your mentees, review code submissions, and track batch progression.
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

        {/* Mentor Action Areas */}
        <div className="mb-6">
          <H2 className="text-base font-bold text-slate-900">Mentor Overview</H2>
          <P variant="muted" className="text-xs text-slate-500">
            Key mentoring areas and pending actions
          </P>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: My Mentees */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                  Batches & Mentees
                </Span>
                <Span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Module 2
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900">Assigned Cohorts</H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Manage assigned students, check progress, and view mentee-mentor mapping once Module
                2 is active.
              </P>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Span className="text-[11px] text-slate-400">Cohort mapping upcoming</Span>
            </div>
          </div>

          {/* Card 2: Submission Reviews */}
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

          {/* Card 3: Curriculum Guide */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Syllabus
                </Span>
                <Span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Module 3
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900">Course Materials</H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Course syllabi, reference architectures, assignment rubrics, and recommended
                solutions.
              </P>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Span className="text-[11px] text-slate-400">Curriculum catalog upcoming</Span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
