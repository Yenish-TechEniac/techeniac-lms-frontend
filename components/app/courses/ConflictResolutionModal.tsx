'use client';

import React from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { P } from '@/components/ui/Typography';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onReload: () => void;
}

export function ConflictResolutionModal({
  isOpen,
  onReload,
}: Readonly<ConflictResolutionModalProps>) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onReload}
      title="Concurrent Edit Conflict (409)"
      description="Another mentor or administrator has modified this item while you were editing. Your current version is out of date."
      size="sm"
      footer={
        <Button
          type="button"
          onClick={onReload}
          size="sm"
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
        >
          Reload Latest Version Now
        </Button>
      }
    >
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900">
        <P className="leading-relaxed">
          To protect against accidental overwrites, please reload the latest version from the server
          and reapply your changes.
        </P>
      </div>
    </Modal>
  );
}
