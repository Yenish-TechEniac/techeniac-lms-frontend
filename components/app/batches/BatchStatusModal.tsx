'use client';

import React, { useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { P, Span } from '@/components/ui/Typography';
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
}: Readonly<BatchStatusModalProps>) {
  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  const [selectedStatus, setSelectedStatus] = useState<BatchStatus | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const newStatus =
    selectedStatus && allowedNextStatuses.includes(selectedStatus)
      ? selectedStatus
      : (allowedNextStatuses[0] ?? currentStatus);

  const { mutateAsync: updateStatus, isPending: isSubmitting } = useUpdateBatchStatusMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Batch Status"
      description={
        <Span>
          Update operational lifecycle state for{' '}
          <strong className="text-slate-800">{batchName}</strong>
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
            form="status-change-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={allowedNextStatuses.length === 0 || isSubmitting}
          >
            Update Status
          </Button>
        </>
      }
    >
      <Form
        id="status-change-form"
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        {error ? <Alert variant="error" title="Status Change Failed" message={error} /> : null}

        {/* Current Status Pill */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
          <Span className="font-semibold text-slate-700">Current Status:</Span>
          <Span className="rounded-full border border-slate-300 bg-slate-200 px-3 py-1 font-mono text-xs font-bold text-slate-900">
            {currentStatus}
          </Span>
        </div>

        {/* New Status Select */}
        {allowedNextStatuses.length > 0 ? (
          <div className="space-y-1.5">
            <Label htmlFor="target-batch-status" required>
              New Allowed Status
            </Label>
            <Select
              id="target-batch-status"
              value={newStatus}
              onChange={(e) => setSelectedStatus(e.target.value as BatchStatus)}
              className="cursor-pointer font-mono text-sm font-bold text-slate-900"
            >
              {allowedNextStatuses.map((st) => (
                <option key={st} value={st} className="font-sans font-medium text-slate-900">
                  {st}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-100 p-3.5 text-center text-xs font-medium text-slate-600">
            <P className="text-xs font-medium text-slate-700">
              This batch has reached final ARCHIVED status. No further state transitions are
              permitted.
            </P>
          </div>
        )}

        {/* Impact Explainer */}
        {allowedNextStatuses.length > 0 ? (
          <div className="space-y-1.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-950 shadow-xs">
            <P className="font-bold text-amber-900">⚠️ Lifecycle Impact (PRD Section 5.3):</P>
            <P className="text-xs leading-relaxed font-medium text-amber-950">
              {getStatusImpactNotice(newStatus)}
            </P>
          </div>
        ) : null}

        {/* Reason (Optional) */}
        <div className="space-y-1">
          <Label htmlFor="status-reason">
            Audit Reason <Span className="text-xs font-normal text-slate-500">(optional)</Span>
          </Label>
          <Textarea
            id="status-reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Record the operational reason for this status change..."
          />
        </div>
      </Form>
    </Modal>
  );
}
