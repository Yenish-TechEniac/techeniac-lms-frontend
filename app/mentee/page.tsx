'use client';

import React from 'react';

import { Header } from '@/components/layout/Header';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function MenteePage() {
  const { user, isAuthorized } = useRoleRedirect({ allowedRoles: ['MENTEE'] });

  if (!isAuthorized || !user) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading student workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Student Portal Active
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome, {user.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Track your course progress, complete assignments, and collaborate with your mentor.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Student Account
              </span>
              <span className="mt-0.5 block font-bold text-slate-800">{user.role}</span>
              <span className="mt-1 block text-slate-500">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Mentee Overview Cards */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900">Your Learning Tracks</h2>
          <p className="text-xs text-slate-500">
            Enrolled courses, submissions, and mentor support
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: My Cohort */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                  Batch & Mentor
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  Module 2
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Assigned Cohort</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                You will be assigned to a cohort and paired with an expert mentor when Module 2 is
                active.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">Enrollment pending batch launch</span>
            </div>
          </div>

          {/* Card 2: Course Progress */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Curriculum
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Module 3
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Courses & Topics</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Access structured learning modules, topic checklists, and hands-on coding exercises.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">Courses upcoming</span>
            </div>
          </div>

          {/* Card 3: Assignments */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Assignments
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Module 4
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Tasks & Submissions</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Submit assignments for code review and receive direct feedback from your mentor.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">No pending submissions</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
