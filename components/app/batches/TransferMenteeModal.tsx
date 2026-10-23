'use client';

import React, { useState } from 'react';

import { useTransferMenteeMutation } from '@/hooks/useBatches';

export interface BatchOption {
  id: string;
  name: string;
  code: string;
  status: string;
}

export interface TransferMenteeModalProps {
  mentee: { id: string; name: string; currentBatchId: string; currentBatchName: string } | null;
  availableBatches: BatchOption[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (menteeId: string, targetBatchId: string, reason?: string) => void;
}

export function TransferMenteeModal({
  mentee,
  availableBatches,
  isOpen,
  onClose,
  onSuccess,
}: TransferMenteeModalProps) {
  const eligibleBatches = availableBatches.filter(
    (b) => b.id !== mentee?.currentBatchId && (b.status === 'LIVE' || b.status === 'DRAFT'),
  );

  const [targetBatchId, setTargetBatchId] = useState<string>(eligibleBatches[0]?.id || '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: transferMentee, isPending: isSubmitting } = useTransferMenteeMutation();

  if (!isOpen || !mentee) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!targetBatchId) return;

    try {
      await transferMentee({
        sourceBatchId: mentee.currentBatchId,
        menteeId: mentee.id,
        targetBatchId,
        reason: reason || undefined,
      });
      onSuccess(mentee.id, targetBatchId, reason);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to transfer mentee.';
      setError(message);
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm duration-150">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Transfer Mentee</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Move <span className="font-semibold text-slate-800">{mentee.name}</span> to a new
              cohort.
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
          id="transfer-form"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4 p-6"
        >
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Current Batch
              </span>
              <span className="font-semibold text-slate-800">{mentee.currentBatchName}</span>
            </div>
            <span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-800">
              ONE-BATCH RULE
            </span>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="target-batch" className="block text-sm font-semibold text-slate-900">
              Select Destination Batch
            </label>
            <select
              id="target-batch"
              value={targetBatchId}
              onChange={(e) => setTargetBatchId(e.target.value)}
              className="h-11 w-full cursor-pointer rounded-[12px] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
            >
              {eligibleBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code}) — {b.status}
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Policy Box (BAT-10) */}
          <div className="space-y-1 rounded-[12px] border border-amber-200 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-900">
            <p className="font-bold">⚠️ Transfer Impact (PRD Section 5.4 / BAT-10):</p>
            <ul className="list-disc space-y-1 pl-4 text-slate-700">
              <li>Membership in {mentee.currentBatchName} ends (status: BATCH_TRANSFER).</li>
              <li>Active mentor mapping in the old batch ends.</li>
              <li>
                Open allocations in the previous batch close as CLOSED_BATCH_CHANGE (read-only).
              </li>
              <li>New batch open courses are allocated with fresh 0% progress.</li>
            </ul>
          </div>

          <div className="space-y-1">
            <label htmlFor="transfer-reason" className="block text-sm font-semibold text-slate-900">
              Transfer Reason <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="transfer-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Schedule realignment or curriculum track adjustment..."
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
            form="transfer-form"
            disabled={!targetBatchId || isSubmitting}
            className="rounded-[10px] bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Transferring...' : 'Execute Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
}
