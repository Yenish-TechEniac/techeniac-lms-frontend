'use client';

import React, { useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FieldError } from '@/components/ui/FieldError';
import { Form } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { H3, P, Span } from '@/components/ui/Typography';
import {
  type CourseAllocation,
  useRevokeAllocationMutation,
  useUpdateAllocationDatesMutation,
} from '@/hooks/useAllocations';

export interface EditAllocationModalProps {
  readonly allocation: CourseAllocation | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: (() => void) | undefined;
}

export function EditAllocationModal(props: EditAllocationModalProps) {
  if (!props.isOpen || !props.allocation) return null;
  return (
    <EditAllocationModalDialog key={props.allocation.id} {...props} allocation={props.allocation} />
  );
}

function EditAllocationModalDialog({
  allocation,
  isOpen,
  onClose,
  onSuccess,
}: Readonly<EditAllocationModalProps & { allocation: CourseAllocation }>) {
  const [startDate, setStartDate] = useState<string>(
    () => allocation.startDate.split('T')[0] ?? '',
  );
  const [dueDate, setDueDate] = useState<string>(() => allocation.dueDate.split('T')[0] ?? '');
  const [errorMsg, setErrorMsg] = useState<unknown>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isConfirmingRevoke, setIsConfirmingRevoke] = useState(false);

  const updateMutation = useUpdateAllocationDatesMutation();
  const revokeMutation = useRevokeAllocationMutation();

  const durationDays = (() => {
    if (!startDate || !dueDate) return null;
    const diffMs = new Date(dueDate).getTime() - new Date(startDate).getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return days >= 0 ? `${days} Days` : 'Invalid';
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setDateError(null);

    if (startDate && dueDate && new Date(dueDate).getTime() < new Date(startDate).getTime()) {
      setDateError('Due date cannot be earlier than start date (ALC-12).');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: allocation.id,
        payload: {
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        },
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err);
    }
  };

  const handleRevoke = async () => {
    setErrorMsg(null);
    try {
      await revokeMutation.mutateAsync(allocation.id);
      setIsConfirmingRevoke(false);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Allocation"
      description={`${allocation.course?.title ?? 'Course'} • ${allocation.batch?.name ?? 'Individual Mentee'}`}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={updateMutation.isPending || revokeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={(e) => void handleSubmit(e)}
            isLoading={updateMutation.isPending || revokeMutation.isPending}
            disabled={updateMutation.isPending || revokeMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <Form className="space-y-6" onSubmit={(e) => void handleSubmit(e)}>
        {errorMsg ? (
          <ErrorMessage
            error={errorMsg}
            title="Failed to update allocation dates"
            onDismiss={() => setErrorMsg(null)}
          />
        ) : null}

        {/* Top Scope / Context Card */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
          <div>
            <Span className="font-mono text-[10px] font-bold tracking-wider text-blue-600 uppercase">
              ALLOCATION TELEMETRY
            </Span>
            <H3 className="mt-0.5 text-sm font-bold text-slate-900">{allocation.course?.title}</H3>
            <P className="mt-0.5 font-mono text-xs text-slate-500">
              {allocation.batch
                ? `${allocation.batch.name} (${allocation.batch.code})`
                : 'Individual Mentee Deployment'}
            </P>
          </div>
          <div className="text-right">
            <Span className="inline-flex rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700">
              Progress: {allocation.progressPercent}%
            </Span>
          </div>
        </div>

        {/* SECTION 1: Schedule & Duration (Stitch 3-Col layout) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <H3 className="text-sm font-semibold text-slate-900">Schedule & Duration</H3>
            <Span className="font-mono text-xs text-slate-400">Synchronized Deployment</Span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="edit-start-date" required>
                Start Date
              </Label>
              <Input
                id="edit-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div>
              <Label htmlFor="edit-duration">Estimated Cadence</Label>
              <Input
                id="edit-duration"
                type="text"
                value={durationDays ?? 'Standard'}
                readOnly
                disabled
                className="w-full bg-slate-100 font-mono text-xs text-slate-600"
              />
            </div>

            <div>
              <Label htmlFor="edit-due-date" required>
                Due Date
              </Label>
              <Input
                id="edit-due-date"
                type="date"
                value={dueDate}
                hasError={Boolean(dateError)}
                errorId="edit-due-date-error"
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (dateError) setDateError(null);
                }}
                className="w-full text-xs font-semibold"
              />
              <FieldError id="edit-due-date-error" error={dateError} />
            </div>
          </div>

          {/* Soft Email Notification Banner */}
          <div className="flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-2.5 text-xs font-medium text-blue-900">
            <Span className="font-bold text-blue-600">✉</Span>
            <Span>
              Mentees will be automatically emailed about due date changes (FR-7.3, ALC-15).
            </Span>
          </div>
        </div>

        {/* SECTION 2: Assigned Mentee Chips */}
        <div className="space-y-3 border-t border-slate-100 pt-2">
          <div className="flex items-center justify-between">
            <H3 className="text-sm font-semibold text-slate-900">Enrolled Mentee</H3>
            <Span className="font-mono text-xs text-slate-400">Single Active Enrollment</Span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100 py-1.5 pr-3 pl-2 text-xs text-slate-800">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 font-mono text-[10px] font-bold text-white">
                {allocation.user?.name ? allocation.user.name.slice(0, 2).toUpperCase() : 'ME'}
              </div>
              <Span className="font-medium text-slate-800">
                {allocation.user?.name ?? 'Mentee'}
              </Span>
              <Span className="font-mono text-[11px] text-slate-400">
                ({allocation.user?.email})
              </Span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Destructive Zone (Soft Revoke) */}
        <div className="border-t border-slate-100 pt-2">
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4 sm:flex-row sm:items-center">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Span className="font-bold text-rose-600">⚠</Span>
                <H3 className="font-mono text-xs font-bold text-rose-800 uppercase">
                  Revoke Allocation
                </H3>
              </div>
              <P className="text-xs text-rose-700">
                Progress is kept; the allocation becomes read-only and hidden from active view
                (FR-7.4, ALC-20).
              </P>
            </div>

            {isConfirmingRevoke ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmingRevoke(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => void handleRevoke()}
                  isLoading={revokeMutation.isPending}
                  className="text-xs"
                >
                  Confirm Revoke
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmingRevoke(true)}
                disabled={allocation.status === 'REVOKED' || allocation.status === 'COMPLETED'}
                className="shrink-0 border-rose-300 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                {allocation.status === 'REVOKED' ? 'Already Revoked' : 'Revoke Allocation'}
              </Button>
            )}
          </div>
        </div>
      </Form>
    </Modal>
  );
}
