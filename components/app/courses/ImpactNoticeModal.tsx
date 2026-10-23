'use client';

import React from 'react';

import type { CourseImpact } from '@/types/courses';

interface ImpactNoticeModalProps {
  isOpen: boolean;
  impact?: CourseImpact | null;
  actionTitle: string;
  actionMessage: string;
  isDestructive?: boolean;
  isBlocked?: boolean;
  blockedMessage?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImpactNoticeModal({
  isOpen,
  impact,
  actionTitle,
  actionMessage,
  isDestructive = false,
  isBlocked = false,
  blockedMessage,
  confirmLabel = 'Confirm Action',
  isLoading = false,
  loadingLabel = 'Processing...',
  onConfirm,
  onCancel,
}: ImpactNoticeModalProps) {
  if (!isOpen) return null;

  const affectedCount = impact?.affectedMenteesCount ?? 0;
  const hasAllocations = (impact?.openAllocationsCount ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isBlocked
                ? 'bg-amber-100 text-amber-700'
                : isDestructive
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-blue-100 text-blue-700'
            }`}
          >
            {isBlocked ? (
              <span className="text-xl font-bold">!</span>
            ) : isDestructive ? (
              <span className="text-xl font-bold">&times;</span>
            ) : (
              <span className="text-xl font-bold">&Delta;</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold break-words break-all text-slate-900">
              {actionTitle}
            </h3>
            <p className="mt-1 text-sm break-words text-slate-600">{actionMessage}</p>
          </div>
        </div>

        {/* Impact Warning Banner */}
        {hasAllocations && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              Live Impact Notice
            </div>
            <p className="mt-1 leading-relaxed">
              This course is currently allocated to{' '}
              <strong className="font-bold underline">{affectedCount} active mentees</strong> across{' '}
              <strong>{impact?.openAllocationsCount} batches/allocations</strong>. Any modification
              applies live immediately to all affected cadets.
            </p>
          </div>
        )}

        {isBlocked && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {blockedMessage ||
              'This course cannot be deleted because it has active mentee allocations. Deactivate the course instead.'}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {isBlocked ? 'Close' : 'Cancel'}
          </button>
          {!isBlocked && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 ${
                isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {isLoading && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isLoading ? loadingLabel : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
