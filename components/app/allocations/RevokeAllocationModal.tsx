'use client';

import React, { useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { P } from '@/components/ui/Typography';
import { useRevokeAllocationMutation } from '@/hooks/useAllocations';
import type { CourseAllocation } from '@/services/allocations.service';

export interface RevokeAllocationModalProps {
  readonly allocation: CourseAllocation | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: (() => void) | undefined;
}

export function RevokeAllocationModal({
  allocation,
  isOpen,
  onClose,
  onSuccess,
}: RevokeAllocationModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const revokeMutation = useRevokeAllocationMutation();

  if (!allocation) return null;

  const handleRevoke = async () => {
    setErrorMsg(null);
    try {
      await revokeMutation.mutateAsync(allocation.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to revoke allocation');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revoke Course Allocation"
      description="Soft revoke this course allocation."
      size="md"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={revokeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => void handleRevoke()}
            isLoading={revokeMutation.isPending}
          >
            Revoke Allocation
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {errorMsg ? <Alert variant="error" title="Error" message={errorMsg} /> : null}

        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <P className="text-sm font-semibold text-rose-900">Warning: Revoking Allocation</P>
          <P className="mt-1 text-xs text-rose-700">
            This will mark the allocation status as <strong>REVOKED</strong>. The course will be
            hidden from the mentee&apos;s active learning list, but all recorded topic progress and
            history will be preserved.
          </P>
        </div>

        <div className="space-y-1 text-xs text-slate-600">
          <P>
            <strong>Mentee:</strong> {allocation.user?.name} ({allocation.user?.email})
          </P>
          <P>
            <strong>Course:</strong> {allocation.course?.title}
          </P>
          <P>
            <strong>Current Progress:</strong> {allocation.progressPercent}%
          </P>
        </div>
      </div>
    </Modal>
  );
}
