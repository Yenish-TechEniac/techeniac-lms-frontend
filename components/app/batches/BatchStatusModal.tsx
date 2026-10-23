'use client';

import React, { useState } from 'react';

import { useUpdateBatchStatusMutation } from '@/hooks/useBatches';
import {
  ALLOWED_STATUS_TRANSITIONS,
  type BatchStatus,
  type ChangeBatchStatusFormData,
  changeBatchStatusSchema,
} from '@/lib/validation';

export interface BatchStatusModalProps {
  batchId: string;
  batchName: string;
  currentStatus: BatchStatus;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (batchId: string, data: ChangeBatchStatusFormData) => void;
}

export function BatchStatusModal({
  batchId,
  batchName,
  currentStatus,
  isOpen,
  onClose,
  onSuccess,
}: BatchStatusModalProps) {
  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  const [newStatus, setNewStatus] = useState<BatchStatus>(allowedNextStatuses[0] ?? currentStatus);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateStatus, isPending: isSubmitting } = useUpdateBatchStatusMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (allowedNextStatuses.length === 0) {
      setError('This batch is in a final status and cannot be changed.');
      return;
    }

    const result = changeBatchStatusSchema.safeParse({ newStatus, reason: reason || undefined });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid status transition.');
      return;
    }

    try {
      await updateStatus({
        batchId,
        newStatus: result.data.newStatus,
        reason: result.data.reason,
      });
      onSuccess(batchId, result.data);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update batch status.';
      setError(message);
    }
  };

  const getStatusImpactNotice = (target: BatchStatus) => {
    switch (target) {
      case 'LIVE':
        return 'Batch becomes visible to mentees. Allocated courses become available and status emails will be dispatched to members.';
      case 'ON_HOLD':
        return 'Batch enters read-only mode for mentees. Progress tracking and submissions are disabled, and automated reminder emails are suspended.';
      case 'COMPLETED':
        return 'Batch closes. Active mentee memberships end (reason: BATCH_COMPLETED), freeing mentees for future cohorts. Mapped mentors may still grade pending submissions.';
      case 'ARCHIVED':
        return 'Final state. Mappings end and the batch is archived from standard operational dashboards. Only Super Admin can view archived batches.';
      default:
        return '';
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm duration-150">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Change Batch Status</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Update operational lifecycle state for{' '}
              <span className="font-semibold text-slate-800">{batchName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form
          id="status-change-form"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4 p-6"
          noValidate
        >
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {error}
            </div>
          ) : null}

          {/* Current Status Pill */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
            <span className="font-semibold text-slate-600">Current Status:</span>
            <span className="rounded-full bg-slate-200 px-2.5 py-1 font-mono font-bold text-slate-800">
              {currentStatus}
            </span>
          </div>

          {/* New Status Select */}
          {allowedNextStatuses.length > 0 ? (
            <div className="space-y-1.5">
              <label
                htmlFor="target-batch-status"
                className="block text-sm font-semibold text-slate-900"
              >
                New Allowed Status
              </label>
              <select
                id="target-batch-status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as BatchStatus)}
                className="h-11 w-full cursor-pointer rounded-[12px] border border-slate-200 bg-white px-3 font-mono text-sm font-semibold text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              >
                {allowedNextStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-100 p-3.5 text-center text-xs font-medium text-slate-600">
              This batch has reached final ARCHIVED status. No further state transitions are
              permitted.
            </div>
          )}

          {/* Impact Explainer */}
          {allowedNextStatuses.length > 0 ? (
            <div className="space-y-1 rounded-[12px] border border-amber-200 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-900">
              <p className="font-bold">⚠️ Lifecycle Impact:</p>
              <p>{getStatusImpactNotice(newStatus)}</p>
            </div>
          ) : null}

          {/* Reason (Optional) */}
          <div className="space-y-1">
            <label htmlFor="status-reason" className="block text-sm font-semibold text-slate-900">
              Audit Reason <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="status-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Record the operational reason for this status change..."
              className="w-full rounded-[12px] border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="status-change-form"
            disabled={allowedNextStatuses.length === 0 || isSubmitting}
            className="rounded-[10px] bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}
