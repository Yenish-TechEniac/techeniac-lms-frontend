'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Code, H3, P, Span } from '@/components/ui/Typography';
import { formatDateTimeIST } from '@/lib/date';
import type { AssignmentDerivedStatus, AssignmentWithSubmissionStatus } from '@/types/submissions';

import { SubmissionStatusBadge } from './SubmissionStatusBadge';

interface MyAssignmentsTableProps {
  assignments: AssignmentWithSubmissionStatus[];
  isLoading: boolean;
  error: string | null;
  selectedStatus?: AssignmentDerivedStatus | undefined;
  onStatusChange?: ((status?: AssignmentDerivedStatus) => void) | undefined;
}

const STATUS_FILTERS: Array<{ label: string; value?: AssignmentDerivedStatus | undefined }> = [
  { label: 'All Assignments', value: undefined },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Resubmit Requested', value: 'RESUBMIT_REQUESTED' },
  { label: 'Graded', value: 'GRADED' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Closed', value: 'CLOSED' },
];

export function MyAssignmentsTable({
  assignments,
  isLoading,
  error,
  selectedStatus,
  onStatusChange,
}: Readonly<MyAssignmentsTableProps>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssignments = assignments.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.courseTitle.toLowerCase().includes(q) ||
      (item.topicTitle && item.topicTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <H3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            My Course Assignments
          </H3>
          <P className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Track, complete, and submit your assignments across allocated courses. All timestamps
            are displayed in Indian Standard Time (IST).
          </P>
        </div>

        {/* Search bar */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 dark:border-slate-800">
        {STATUS_FILTERS.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => onStatusChange?.(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {error ? <Alert variant="error" title="Failed to load assignments" message={error} /> : null}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <P className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Loading your assignments in Indian Standard Time...
          </P>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <P className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No assignments found
          </P>
          <P className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {selectedStatus || searchQuery
              ? 'Try adjusting your filters or search keywords.'
              : 'You have no assignments allocated in your current courses.'}
          </P>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Assignment & Course
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Due Date (IST)
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Est. Time & Marks
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <Link
                          href={`/mentee/assignments/${assignment.id}`}
                          className="line-clamp-1 font-semibold text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                        >
                          {assignment.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <Span className="font-medium text-slate-700 dark:text-slate-300">
                            {assignment.courseTitle}
                          </Span>
                          {assignment.topicTitle ? (
                            <>
                              <span>•</span>
                              <span>{assignment.topicTitle}</span>
                            </>
                          ) : null}
                          <span>•</span>
                          <Span className="py-0.2 rounded bg-slate-100 px-1.5 font-mono text-[10px] dark:bg-slate-800">
                            {assignment.scope}
                          </Span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <Span className="font-medium text-slate-900 dark:text-slate-100">
                          {formatDateTimeIST(assignment.dueDate)}
                        </Span>
                        {assignment.allowLate ? (
                          <Span className="block text-[10px] text-slate-400">
                            Late submissions accepted
                          </Span>
                        ) : (
                          <Span className="block text-[10px] text-rose-500">Strict deadline</Span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                        <div>
                          Est:{' '}
                          <Span className="font-semibold">{assignment.estimatedMinutes} mins</Span>
                        </div>
                        <div>
                          Max Marks: <Code className="text-[11px]">{assignment.maxMarks}</Code>
                          {assignment.passMarks ? ` (Pass: ${assignment.passMarks})` : ''}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <SubmissionStatusBadge
                        status={assignment.status}
                        isLate={assignment.latestSubmission?.isLate}
                      />
                      {assignment.latestSubmission?.marks !== null &&
                      assignment.latestSubmission?.marks !== undefined ? (
                        <div className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Score: {assignment.latestSubmission.marks} / {assignment.maxMarks}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link href={`/mentee/assignments/${assignment.id}`}>
                        <Button
                          variant={
                            assignment.status === 'PENDING' ||
                            assignment.status === 'RESUBMIT_REQUESTED'
                              ? 'primary'
                              : 'secondary'
                          }
                          size="sm"
                        >
                          {assignment.status === 'PENDING'
                            ? 'Start & Submit'
                            : assignment.status === 'RESUBMIT_REQUESTED'
                              ? 'Resubmit'
                              : 'View Details'}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
