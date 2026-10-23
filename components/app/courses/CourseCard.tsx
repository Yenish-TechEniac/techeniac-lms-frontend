'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import type { Course } from '@/types/courses';

import { formatDurationMinutes } from './types';

interface CourseCardProps {
  course: Course;
  onRefresh: () => void;
  onCloneCourse: (course: Course) => Promise<void>;
  onRequestDelete: (course: Course) => void;
  onRequestToggleStatus: (course: Course) => void;
}

export function CourseCard({
  course,
  onCloneCourse,
  onRequestDelete,
  onRequestToggleStatus,
}: CourseCardProps) {
  const [isCloning, setIsCloning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClone = async () => {
    setIsCloning(true);
    setErrorMsg(null);
    try {
      await onCloneCourse(course);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to clone course';
      setErrorMsg(msg);
    } finally {
      setIsCloning(false);
    }
  };

  const topicCount = course.topicCount ?? course.topics?.length ?? 0;
  const assignmentCount =
    course.assignmentCount ??
    (course.courseAssignments?.length ?? course.assignments?.length ?? 0) +
      (course.topics?.reduce((acc, t) => acc + (t.assignments?.length ?? 0), 0) ?? 0);

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm">
      <div>
        {/* Top Header: Badges & Duration */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                course.isActive
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border border-slate-200 bg-slate-100 text-slate-600'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${course.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
              />
              {course.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formatDurationMinutes(course.estimatedMinutes)}</span>
          </div>
        </div>

        {/* Course Title & Description */}
        <h3 className="mt-3 text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600">
          {course.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {course.description || 'No description provided.'}
        </p>

        {/* Telemetry Stats: Topics, Assignments, Allocations */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-100 py-2.5 text-center text-xs">
          <div>
            <span className="block font-bold text-slate-800">{topicCount}</span>
            <span className="text-[10px] text-slate-400 uppercase">Topics</span>
          </div>
          <div>
            <span className="block font-bold text-slate-800">{assignmentCount}</span>
            <span className="text-[10px] text-slate-400 uppercase">Tasks</span>
          </div>
          <div>
            <span className="block font-bold text-slate-800">{course.allocationCount ?? 0}</span>
            <span className="text-[10px] text-slate-400 uppercase">Mentees</span>
          </div>
        </div>

        {/* Usage Telemetry Info (FR-6.6) */}
        <div className="mt-2.5 text-[11px] text-slate-500">
          {course.allocationCount && course.allocationCount > 0 ? (
            <span>
              Assigned to <strong>{course.allocationCount} mentees</strong>
              {course.lastAssignedAt
                ? ` • Last: ${new Date(course.lastAssignedAt).toLocaleDateString()}`
                : ''}
            </span>
          ) : (
            <span className="text-slate-400 italic">Not yet allocated to any mentees</span>
          )}
        </div>

        {errorMsg && (
          <div className="mt-2 rounded-md bg-rose-50 p-2 text-xs text-rose-700">{errorMsg}</div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/courses/${course.id}/builder`}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Builder &rarr;
          </Link>

          {/* Assign Button (FR-6.6, CRS-16: Disabled if Inactive) */}
          <button
            type="button"
            disabled={!course.isActive}
            title={
              course.isActive
                ? 'Allocate this course to a batch or mentees'
                : 'Inactive courses cannot be newly allocated'
            }
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              course.isActive
                ? 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
            }`}
          >
            Assign
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Clone Button (FR-6.7, CRS-21) */}
          <button
            type="button"
            disabled={isCloning}
            onClick={() => {
              void handleClone();
            }}
            title="Clone Course (Creates Inactive Copy)"
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {isCloning ? '...' : 'Clone'}
          </button>

          {/* Toggle Active/Inactive (FR-6.11) */}
          <button
            type="button"
            onClick={() => onRequestToggleStatus(course)}
            title={course.isActive ? 'Deactivate course' : 'Activate course'}
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {course.isActive ? 'Deactivate' : 'Activate'}
          </button>

          {/* Soft Delete (FR-6.7, CRS-20) */}
          <button
            type="button"
            onClick={() => onRequestDelete(course)}
            title="Delete course"
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
