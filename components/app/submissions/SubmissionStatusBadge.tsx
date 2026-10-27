import React from 'react';

import { Span } from '@/components/ui/Typography';
import { cn } from '@/lib/cn';
import type { AssignmentDerivedStatus } from '@/types/submissions';

interface SubmissionStatusBadgeProps {
  status: AssignmentDerivedStatus;
  isLate?: boolean | undefined;
  className?: string | undefined;
}

const STATUS_CONFIG: Record<
  AssignmentDerivedStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
  },
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  RESUBMIT_REQUESTED: {
    label: 'Resubmit Requested',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  GRADED: {
    label: 'Graded',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  OVERDUE: {
    label: 'Overdue',
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
};

export function SubmissionStatusBadge({
  status,
  isLate,
  className,
}: Readonly<SubmissionStatusBadgeProps>) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <Span
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
          config.bg,
          config.text,
          config.border,
        )}
      >
        {config.label}
      </Span>
      {isLate ? (
        <Span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          Late
        </Span>
      ) : null}
    </div>
  );
}
