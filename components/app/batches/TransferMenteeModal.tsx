'use client';

import React, { useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { P, Span } from '@/components/ui/Typography';
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Mentee"
      description={
        <Span>
          Move <strong className="font-semibold text-slate-800">{mentee.name}</strong> to a new
          cohort.
        </Span>
      }
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="transfer-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!targetBatchId || isSubmitting}
          >
            Execute Transfer
          </Button>
        </>
      }
    >
      <form
        id="transfer-form"
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
        noValidate
      >
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          >
            <P>{error}</P>
          </div>
        ) : null}

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
          <div>
            <Span className="block text-[10px] font-bold text-slate-400 uppercase">
              Current Batch
            </Span>
            <Span className="font-semibold text-slate-800">{mentee.currentBatchName}</Span>
          </div>
          <Span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-800">
            ONE-BATCH RULE
          </Span>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="target-batch" required>
            Select Destination Batch
          </Label>
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
          <P className="font-bold">⚠️ Transfer Impact (PRD Section 5.4 / BAT-10):</P>
          <ul className="list-disc space-y-1 pl-4 text-slate-700">
            <li>
              <Span>Membership in {mentee.currentBatchName} ends (status: BATCH_TRANSFER).</Span>
            </li>
            <li>
              <Span>Active mentor mapping in the old batch ends.</Span>
            </li>
            <li>
              <Span>
                Open allocations in the previous batch close as CLOSED_BATCH_CHANGE (read-only).
              </Span>
            </li>
            <li>
              <Span>New batch open courses are allocated with fresh 0% progress.</Span>
            </li>
          </ul>
        </div>

        <div className="space-y-1">
          <Label htmlFor="transfer-reason">
            Transfer Reason <Span className="text-xs font-normal text-slate-400">(optional)</Span>
          </Label>
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
    </Modal>
  );
}
