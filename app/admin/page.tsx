'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/login');
      } else if (user.mustChangePassword) {
        router.replace('/change-password');
      } else if (user.role !== 'SUPER_ADMIN') {
        if (user.role === 'MENTOR') {
          router.replace('/mentor');
        } else {
          router.replace('/mentee');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || !user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading admin console...</p>
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
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Super Admin Access
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Super Admin Control Center
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage organization identities, batch deployments, curriculum standards, and audit
                logs.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Active Administrator
              </span>
              <span className="mt-0.5 block font-bold text-slate-800">{user.name}</span>
              <span className="mt-1 block text-slate-500">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Administration Pillars */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900">System Governance</h2>
          <p className="text-xs text-slate-500">Core administrative domains across the LMS</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Module 1: IAM */}
          <Link
            href="/admin/users"
            className="group flex flex-col justify-between rounded-xl border border-purple-200 bg-purple-50/50 p-5 shadow-xs transition-all hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-purple-700 uppercase">
                  Module 1
                </span>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800">
                  Operational
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900 transition-colors group-hover:text-purple-700">
                User Management
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Super Admin, Mentor, and Mentee accounts. Password resets, role history, and token
                versions.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-purple-100 pt-3">
              <span className="text-[11px] font-semibold text-purple-700 group-hover:underline">
                Manage Users &rarr;
              </span>
              <span className="text-[10px] font-medium text-purple-600">Contract Synchronized</span>
            </div>
          </Link>

          {/* Module 2: Batches */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Module 2
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Upcoming
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Batches & Cohorts</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Batch creation (DRAFT, LIVE, COMPLETED), mentor-mentee mapping, and batch transfers.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">Scheduled next</span>
            </div>
          </div>

          {/* Module 3: Curriculum */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Module 3
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Upcoming
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Curriculum & Courses</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Course authoring, topics, subtopics, assignments, and course allocations.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">Scheduled next</span>
            </div>
          </div>

          {/* Module 4: Submissions & Audits */}
          <Link
            href="/admin/audit-logs"
            className="group flex flex-col justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                  Module 4
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                  Operational
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                Submissions & Audits
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                System events, entity changes, authentication tracking, and before/after diff
                modals.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-blue-100 pt-3">
              <span className="text-[11px] font-semibold text-blue-700 group-hover:underline">
                View Audit Logs &rarr;
              </span>
              <span className="text-[10px] font-medium text-blue-600">Live API Active</span>
            </div>
          </Link>
        </div>

        {/* System Telemetry */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">API Connection Status</h3>
              <p className="text-xs text-slate-500">
                Connected to Node.js 24 / Express backend service at{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700">
                  /api/v1
                </code>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">Online & Synchronized</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
