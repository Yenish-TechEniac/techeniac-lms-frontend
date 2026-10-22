'use client';

import React from 'react';

import { MENTOR_PORTAL_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { Header } from '@/components/layout/Header';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function MentorPage() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['MENTOR'] });

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading mentor workspace..."
        spinnerColor="border-emerald-600"
        retryButtonColor="bg-emerald-600 hover:bg-emerald-700"
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
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Mentor Workspace Active</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome, {user.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Guide your mentees, review code submissions, and track batch progression.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Assigned Role
              </span>
              <span className="mt-0.5 block font-bold text-slate-800">{user.role}</span>
              <span className="mt-1 block text-slate-500">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Mentor Action Areas */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900">Mentor Overview</h2>
          <p className="text-xs text-slate-500">Key mentoring areas and pending actions</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: My Mentees */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                  Batches & Mentees
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Module 2
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Assigned Cohorts</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Manage assigned students, check progress, and view mentee-mentor mapping once Module
                2 is active.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">Cohort mapping upcoming</span>
            </div>
          </div>

          {/* Card 2: Submission Reviews */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Grading Queue
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Module 4
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Assignment Reviews</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Review code submissions, provide feedback, request resubmissions, and mark grades.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">Zero pending reviews</span>
            </div>
          </div>

          {/* Card 3: Curriculum Guide */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Syllabus
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Module 3
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Course Materials</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Course syllabi, reference architectures, assignment rubrics, and recommended
                solutions.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">Curriculum catalog upcoming</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
