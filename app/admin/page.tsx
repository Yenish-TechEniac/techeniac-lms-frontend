'use client';

import Link from 'next/link';
import React from 'react';

import { ADMIN_PORTAL_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Code, H1, H2, H3, P, Span } from '@/components/ui/Typography';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function AdminPage() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['SUPER_ADMIN'] });

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading admin console..."
        spinnerColor="border-purple-600"
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...ADMIN_PORTAL_NAV} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                <Span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                <Span>Super Admin Access</Span>
              </div>
              <H1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Super Admin Control Center
              </H1>
              <P variant="muted" className="mt-1 text-sm text-slate-500">
                Manage organization identities, batch deployments, curriculum standards, and audit
                logs.
              </P>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
                <Span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Active Administrator
                </Span>
                <Span className="mt-0.5 block font-bold text-slate-800">{user.name}</Span>
                <Span className="mt-1 block text-slate-500">{user.email}</Span>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/admin/batches?create=true">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/25 hover:bg-blue-700"
                  >
                    <Span className="text-sm font-extrabold">+</Span>
                    <Span>Create Batch</Span>
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 rounded-xl border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
                  >
                    <Span>Manage Users</Span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Administration Pillars */}
        <div className="mb-6">
          <H2 className="text-base font-bold text-slate-900">System Governance</H2>
          <P variant="muted" className="text-xs text-slate-500">
            Core administrative domains across the LMS
          </P>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Module 1: IAM */}
          <Link
            href="/admin/users"
            className="group flex flex-col justify-between rounded-xl border border-purple-200 bg-purple-50/50 p-5 shadow-xs transition-all hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-purple-700 uppercase">
                  Module 1
                </Span>
                <Span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800">
                  Operational
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900 transition-colors group-hover:text-purple-700">
                User Management
              </H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Super Admin, Mentor, and Mentee accounts. Password resets, role history, and token
                versions.
              </P>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-purple-100 pt-3">
              <Span className="text-[11px] font-semibold text-purple-700 group-hover:underline">
                Manage Users &rarr;
              </Span>
              <Span className="text-[10px] font-medium text-purple-600">Contract Synchronized</Span>
            </div>
          </Link>

          {/* Module 2: Batches */}
          <div className="group flex flex-col justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                  Module 2
                </Span>
                <Span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                  Operational
                </Span>
              </div>
              <Link href="/admin/batches" className="block">
                <H3 className="mt-2 text-base font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                  Batches & Cohorts
                </H3>
              </Link>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Batch creation (DRAFT, LIVE, COMPLETED), mentor-mentee mapping, and batch transfers.
              </P>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-blue-100 pt-3">
              <Link
                href="/admin/batches"
                className="text-[11px] font-semibold text-blue-700 hover:underline"
              >
                <Span>Manage Batches &rarr;</Span>
              </Link>
              <Link
                href="/admin/batches?create=true"
                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-blue-700"
              >
                <Span>+</Span>
                <Span>Create</Span>
              </Link>
            </div>
          </div>

          {/* Module 6: Curriculum & Courses */}
          <Link
            href="/admin/courses"
            className="group flex flex-col justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                  Module 6
                </Span>
                <Span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                  Operational
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                Course Library & Builder
              </H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Course authoring, outline trees, subtopic lessons, embedded assignments, and live
                saves.
              </P>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-blue-100 pt-3">
              <Span className="text-[11px] font-semibold text-blue-700 group-hover:underline">
                Course Library &rarr;
              </Span>
              <Span className="text-[10px] font-medium text-blue-600">Contract Synchronized</Span>
            </div>
          </Link>

          {/* Module 4: Submissions */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <Span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Module 4
                </Span>
                <Span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Upcoming
                </Span>
              </div>
              <H3 className="mt-2 text-base font-bold text-slate-900">Submissions & Audits</H3>
              <P className="mt-1 text-xs leading-relaxed text-slate-600">
                Mentee assignment submissions, mentor review rubrics, resubmissions, and audit
                history.
              </P>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Span className="text-[11px] text-slate-400">Scheduled next</Span>
            </div>
          </div>
        </div>

        {/* System Telemetry */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <H3 className="text-sm font-bold text-slate-900">API Connection Status</H3>
              <P variant="muted" className="text-xs text-slate-500">
                Connected to Node.js 24 / Express backend service at{' '}
                <Code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700">
                  /api/v1
                </Code>
              </P>
            </div>
            <div className="flex items-center gap-2">
              <Span className="h-2 w-2 rounded-full bg-emerald-500" />
              <Span className="text-xs font-semibold text-emerald-700">Online & Synchronized</Span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
