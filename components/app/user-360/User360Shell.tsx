'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useUser360 } from '@/hooks/useUser360';
import type { User360FilterState } from '@/types/user-360';

interface User360ShellProps {
  userId: string;
}

type TabKey =
  | 'profile'
  | 'role-history'
  | 'batch-history'
  | 'mentor-mapping-history'
  | 'course-history'
  | 'assignment-grade-history'
  | 'performance-summary'
  | 'audit';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'role-history', label: 'Role History' },
  { key: 'batch-history', label: 'Batch History' },
  { key: 'mentor-mapping-history', label: 'Mentor Mapping History' },
  { key: 'course-history', label: 'Course History' },
  { key: 'assignment-grade-history', label: 'Assignment & Grade History' },
  { key: 'performance-summary', label: 'Performance Summary' },
  { key: 'audit', label: 'Audit Log' },
];

export function User360Shell({ userId }: User360ShellProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [filters, setFilters] = useState<User360FilterState>({});
  const [isExporting, setIsExporting] = useState(false);

  const { profile, isLoading, isError, error, downloadCsv } = useUser360(userId, filters);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await downloadCsv();
    } catch {
      alert('Failed to download CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (key: keyof User360FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" />
          <p className="mt-3 text-sm text-slate-500">Loading User 360 profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-800">
        <h2 className="text-lg font-semibold">Error Loading User 360 Profile</h2>
        <p className="mt-1 text-sm">{error ?? 'User not found or access denied.'}</p>
        <div className="mt-4">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              &larr; Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { user, tabs } = profile;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Identity Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2">
              <Link
                href="/admin/users"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                &larr; Back to User Directory
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  user.role === 'SUPER_ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : user.role === 'MENTOR'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                }`}
              >
                {user.role}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void handleExportCsv();
              }}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export as CSV'}
            </Button>
          </div>
        </div>

        {/* Global Filter Bar (FR-3.1) */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label
                htmlFor="filter-role-period"
                className="block text-xs font-medium text-slate-600"
              >
                Filter by Role Period
              </label>
              <select
                id="filter-role-period"
                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                value={filters.rolePeriod ?? ''}
                onChange={(e) => handleFilterChange('rolePeriod', e.target.value)}
              >
                <option value="">All Role Periods</option>
                <option value="MENTEE">As Mentee</option>
                <option value="MENTOR">As Mentor</option>
                <option value="SUPER_ADMIN">As Super Admin</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-start-date"
                className="block text-xs font-medium text-slate-600"
              >
                From Date
              </label>
              <input
                id="filter-start-date"
                type="date"
                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                value={filters.startDate ?? ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="filter-end-date" className="block text-xs font-medium text-slate-600">
                To Date
              </label>
              <input
                id="filter-end-date"
                type="date"
                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                value={filters.endDate ?? ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {activeTab === 'audit' && (
              <div>
                <label
                  htmlFor="filter-audit-type"
                  className="block text-xs font-medium text-slate-600"
                >
                  Audit Type
                </label>
                <select
                  id="filter-audit-type"
                  className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  value={filters.auditType ?? ''}
                  onChange={(e) => handleFilterChange('auditType', e.target.value)}
                >
                  <option value="">All Audit Types</option>
                  <option value="GRADING">Grading (HIS-09)</option>
                  <option value="USER_ROLE">Role Changes</option>
                  <option value="BATCH">Batch Membership</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* 1. Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">User Identity & Profile</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-xs text-slate-500">User ID</span>
                <p className="mt-1 font-mono text-xs font-medium text-slate-800">{user.id}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-xs text-slate-500">Full Name</span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{user.name}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-xs text-slate-500">Email Address</span>
                <p className="mt-1 text-sm font-medium text-slate-800">{user.email}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-xs text-slate-500">Current Role</span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{user.role}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-xs text-slate-500">Account Created</span>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-xs text-slate-500">Last Login</span>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Role History Tab */}
        {activeTab === 'role-history' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Role History Timeline</h2>
            {tabs.roleHistory.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No role history records found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Period Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tabs.roleHistory.map((rh) => (
                      <tr key={rh.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{rh.role}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(rh.fromAt).toLocaleDateString()} &ndash;{' '}
                          {rh.toAt ? new Date(rh.toAt).toLocaleDateString() : 'Present'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{rh.reason}</td>
                        <td className="px-4 py-3 font-medium text-blue-700">{rh.periodLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. Batch History Tab */}
        {activeTab === 'batch-history' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Batch Participation History</h2>
            {tabs.batchHistory.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No batch history found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Batch</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Joined At</th>
                      <th className="px-4 py-3">Left At</th>
                      <th className="px-4 py-3">Reason To Leave</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Period Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tabs.batchHistory.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {b.batchName} ({b.batchCode})
                        </td>
                        <td className="px-4 py-3 text-slate-700">{b.role}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(b.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {b.leftAt ? new Date(b.leftAt).toLocaleDateString() : '&mdash;'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{b.reasonToLeave ?? '&mdash;'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              b.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {b.isActive ? 'Active' : 'Left'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-blue-700">{b.periodLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. Mentor Mapping History Tab */}
        {activeTab === 'mentor-mapping-history' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              Mentor & Mentee Mapping History
            </h2>
            {tabs.mentorMappingHistory.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No mentor mappings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Batch</th>
                      <th className="px-4 py-3">Role in Mapping</th>
                      <th className="px-4 py-3">Mapped Peer</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Period Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tabs.mentorMappingHistory.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{m.batchCode}</td>
                        <td className="px-4 py-3 text-slate-700">{m.mappedRole}</td>
                        <td className="px-4 py-3 text-slate-800">
                          {m.peerName} <span className="text-slate-500">({m.peerEmail})</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(m.startDate).toLocaleDateString()} &ndash;{' '}
                          {m.endDate ? new Date(m.endDate).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              m.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {m.isActive ? 'Active' : 'Ended'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-blue-700">{m.periodLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. Course History Tab */}
        {activeTab === 'course-history' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              Allocated Courses & Curriculum
            </h2>
            {tabs.courseHistory.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center">
                <p className="text-sm font-medium text-slate-500">
                  No course allocations recorded.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {user.role === 'MENTOR'
                    ? 'This user has only mentor history and was never enrolled in courses as a mentee.'
                    : 'No courses have been allocated yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Course Title</th>
                      <th className="px-4 py-3">Batch</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Progress</th>
                      <th className="px-4 py-3">Timeline</th>
                      <th className="px-4 py-3">Period Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tabs.courseHistory.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{c.courseTitle}</td>
                        <td className="px-4 py-3 text-slate-600">{c.batchCode ?? 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              c.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {c.progressPercent}%
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(c.startDate).toLocaleDateString()} &ndash;{' '}
                          {new Date(c.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-blue-700">{c.periodLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 6. Assignment & Grade History Tab */}
        {activeTab === 'assignment-grade-history' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              Assignments, Submissions & Grading
            </h2>
            {tabs.assignmentGradeHistory.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center">
                <p className="text-sm font-medium text-slate-500">
                  No submissions or grades recorded.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {user.role === 'MENTOR'
                    ? 'This user has only mentor history and has never submitted assignments as a mentee.'
                    : 'No assignments submitted yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Assignment</th>
                      <th className="px-4 py-3">Version</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Marks & Grade</th>
                      <th className="px-4 py-3">Graded By</th>
                      <th className="px-4 py-3">Feedback</th>
                      <th className="px-4 py-3">Period Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tabs.assignmentGradeHistory.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {s.assignmentTitle}
                        </td>
                        <td className="px-4 py-3 text-slate-600">v{s.version}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              s.status === 'GRADED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {s.marks !== null ? `${s.marks} (${s.gradeLabel ?? 'N/A'})` : '&mdash;'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{s.graderName ?? '&mdash;'}</td>
                        <td
                          className="max-w-xs truncate px-4 py-3 text-slate-600"
                          title={s.feedback ?? ''}
                        >
                          {s.feedback ?? '&mdash;'}
                        </td>
                        <td className="px-4 py-3 font-medium text-blue-700">{s.periodLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 7. Performance Summary Tab */}
        {activeTab === 'performance-summary' && (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900">Learning Performance Summary</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <span className="text-xs text-slate-500">Allocated Courses</span>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {tabs.performanceSummary.totalAllocations}
                </p>
                <span className="text-[11px] text-slate-400">
                  {tabs.performanceSummary.completedAllocations} completed
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <span className="text-xs text-slate-500">Average Progress</span>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {tabs.performanceSummary.averageProgressPercent.toFixed(1)}%
                </p>
                <span className="text-[11px] text-slate-400">across allocations</span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <span className="text-xs text-slate-500">Total Submissions</span>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {tabs.performanceSummary.totalSubmissions}
                </p>
                <span className="text-[11px] text-slate-400">
                  {tabs.performanceSummary.gradedSubmissions} graded
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <span className="text-xs text-slate-500">Average Marks</span>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {tabs.performanceSummary.averageMarks !== null
                    ? tabs.performanceSummary.averageMarks.toFixed(1)
                    : '&mdash;'}
                </p>
                <span className="text-[11px] text-slate-400">
                  {tabs.performanceSummary.onTimeRatePercent.toFixed(0)}% on-time
                </span>
              </div>
            </div>

            {/* Grade Distribution */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Grade Distribution</h3>
              <div className="mt-2 flex flex-wrap gap-3">
                {Object.keys(tabs.performanceSummary.gradeDistribution).length === 0 ? (
                  <p className="text-xs text-slate-500">No grades recorded.</p>
                ) : (
                  Object.entries(tabs.performanceSummary.gradeDistribution).map(
                    ([grade, count]) => (
                      <div
                        key={grade}
                        className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm"
                      >
                        <span className="font-bold text-slate-900">Grade {grade}:</span>
                        <span className="font-semibold text-blue-600">{count}</span>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* 8. Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">User Audit Log Trail</h2>
            {tabs.audit.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No audit events match current filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Audit Type</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">Period Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tabs.audit.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(a.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              a.type === 'GRADING'
                                ? 'bg-purple-100 text-purple-800'
                                : a.type === 'USER_ROLE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {a.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] font-semibold text-slate-800">
                          {a.action}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                          {JSON.stringify(a.details)}
                        </td>
                        <td className="px-4 py-3 font-medium text-blue-700">{a.periodLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
