'use client';

import React, { useEffect, useId } from 'react';

import { Button, type ButtonVariant } from '@/components/ui/Button';
import { H3, P, Span } from '@/components/ui/Typography';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string | undefined;
  cancelLabel?: string | undefined;
  confirmVariant?: ButtonVariant | undefined;
  isLoading?: boolean | undefined;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
}: Readonly<ConfirmationModalProps>) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="animate-in fade-in zoom-in-95 w-full max-w-sm rounded-3xl border border-[#E1E6EC] bg-white p-6 text-center shadow-xl duration-150 sm:p-7"
      >
        {/* Red Circular Question Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl font-bold text-white shadow-xs">
          ?
        </div>

        {/* Title */}
        <H3 id={titleId} className="mt-4 text-lg font-bold text-slate-900">
          {title}
        </H3>

        {/* Description */}
        <P
          id={descId}
          className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-slate-500 sm:text-sm"
        >
          {description}
        </P>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 rounded-full border-[#0044D3] px-6 text-xs font-semibold text-[#0044D3] hover:bg-blue-50"
          >
            <Span>{cancelLabel}</Span>
          </Button>

          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            onClick={() => {
              void onConfirm();
            }}
            isLoading={isLoading}
            className={`h-10 rounded-full px-6 text-xs font-semibold text-white ${
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#0044D3] hover:bg-[#0039B3]'
            }`}
          >
            <Span>{confirmLabel}</Span>
          </Button>
        </div>
      </div>
    </div>
  );
}
