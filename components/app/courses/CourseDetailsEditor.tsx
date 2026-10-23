'use client';

import React, { useState } from 'react';

import { formatErrorMessage } from '@/lib/errors';
import type { Course, CourseImpact, UpdateCourseInput } from '@/types/courses';

interface CourseDetailsEditorProps {
  course: Course;
  impact?: CourseImpact | null | undefined;
  topicsTotalMinutes?: number | undefined;
  onSaveCourse: (payload: UpdateCourseInput) => Promise<Course>;
  onConflict: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

export function CourseDetailsEditor({
  course,
  impact,
  topicsTotalMinutes = 0,
  onSaveCourse,
  onConflict,
  onDirtyChange,
}: CourseDetailsEditorProps) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description || '');

  const initialHours = course.estimatedMinutes ? Math.floor(course.estimatedMinutes / 60) : 0;
  const initialMinutes = course.estimatedMinutes ? course.estimatedMinutes % 60 : 0;

  const [durationHours, setDurationHours] = useState<string>(
    initialHours > 0 || initialMinutes > 0 ? String(initialHours) : '',
  );
  const [durationMinutes, setDurationMinutes] = useState<string>(
    initialHours > 0 || initialMinutes > 0 ? String(initialMinutes) : '',
  );
  const [isActive, setIsActive] = useState(course.isActive);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalEstimatedMins =
    durationHours !== '' || durationMinutes !== ''
      ? (parseInt(durationHours, 10) || 0) * 60 + (parseInt(durationMinutes, 10) || 0)
      : null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Course title cannot be empty.');
      return;
    }

    if (totalEstimatedMins !== null && totalEstimatedMins <= 0) {
      setErrorMsg('Please enter a valid positive duration greater than 0 minutes.');
      return;
    }

    if (durationMinutes !== '') {
      const parsedMins = parseInt(durationMinutes, 10);
      if (isNaN(parsedMins) || parsedMins < 0 || parsedMins > 59) {
        setErrorMsg('Minutes must be between 0 and 59.');
        return;
      }
    }

    if (
      topicsTotalMinutes > 0 &&
      totalEstimatedMins !== null &&
      totalEstimatedMins < topicsTotalMinutes
    ) {
      setErrorMsg(
        `Course duration (${Math.floor(totalEstimatedMins / 60)}h ${totalEstimatedMins % 60}m) cannot be less than the total duration allocated to its topics (${Math.floor(topicsTotalMinutes / 60)}h ${topicsTotalMinutes % 60}m).`,
      );
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      await onSaveCourse({
        title: title.trim(),
        description: description.trim() || null,
        estimatedMinutes: totalEstimatedMins,
        isActive,
        expectedUpdatedAt: course.updatedAt,
      });

      onDirtyChange(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        (err as { status: number }).status === 409
      ) {
        onConflict();
      } else {
        setErrorMsg(formatErrorMessage(err, 'Failed to save course changes'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (updater: () => void) => {
    updater();
    onDirtyChange(true);
  };

  const affectedMentees = impact?.affectedMenteesCount ?? 0;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 sm:p-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Course Root Settings
          </span>
          <h2 className="text-xl font-bold text-slate-900">{course.title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Saved Live
            </span>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              void handleSave();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Impact Notice on Open Allocations (FR-6.10, CRS-09) */}
      {affectedMentees > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            Live Impact Notice
          </div>
          <p className="mt-1 leading-relaxed">
            This course is allocated to <strong>{affectedMentees} active mentees</strong>. Changes
            saved here take effect live immediately across all enrolled cadet dashboards with an
            audit log record.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* Form Fields */}
      <form
        noValidate
        onSubmit={(e) => {
          void handleSave(e);
        }}
        className="mt-6 max-w-2xl space-y-5"
      >
        <div>
          <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
            Course Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleChange(() => setTitle(e.target.value))}
            placeholder="e.g. Distributed Systems Engineering"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => handleChange(() => setDescription(e.target.value))}
            placeholder="Provide a comprehensive syllabus overview..."
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
            Total Estimated Duration
          </label>
          <div className="mt-1.5 grid max-w-xs grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                Hours
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min={0}
                  value={durationHours}
                  onChange={(e) => handleChange(() => setDurationHours(e.target.value))}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                  hrs
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                Minutes
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={durationMinutes}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const sanitized =
                      raw === ''
                        ? ''
                        : Math.min(59, Math.max(0, parseInt(raw, 10) || 0)).toString();
                    handleChange(() => setDurationMinutes(sanitized));
                  }}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-hidden"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                  mins
                </span>
              </div>
            </div>
          </div>
          <span className="mt-1.5 block text-xs text-slate-500">
            {totalEstimatedMins !== null && totalEstimatedMins > 0
              ? `${totalEstimatedMins} minutes total (${Math.floor(totalEstimatedMins / 60)}h ${totalEstimatedMins % 60}m)`
              : 'Optional. Used to prefill allocation due dates.'}
          </span>
          {topicsTotalMinutes > 0 && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
              <span>
                Currently allocated across topics:{' '}
                <strong>
                  {Math.floor(topicsTotalMinutes / 60)}h {topicsTotalMinutes % 60}m
                </strong>
                . Course duration cannot be lower than this total.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <span className="block text-xs font-bold text-slate-900">Course Visibility Status</span>
            <span className="text-[11px] text-slate-500">
              Inactive courses cannot be newly allocated. Existing allocations continue normally.
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleChange(() => setIsActive(!isActive))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isActive ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </form>
    </div>
  );
}
