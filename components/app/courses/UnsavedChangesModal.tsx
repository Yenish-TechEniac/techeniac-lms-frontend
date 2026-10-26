'use client';

import React from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { P } from '@/components/ui/Typography';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesModal({ isOpen, onStay, onDiscard }: UnsavedChangesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onStay}
      title="Unsaved Changes Guard"
      description="You have unsaved changes in this form. If you navigate away or switch nodes now, your edits will be discarded."
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onStay} size="sm">
            Stay & Keep Editing
          </Button>
          <Button type="button" variant="danger" onClick={onDiscard} size="sm">
            Discard Changes
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
        <span className="font-bold">Notice:</span>
        <P className="leading-relaxed">
          Unsaved modifications on this outline node will be permanently lost if you discard.
        </P>
      </div>
    </Modal>
  );
}
