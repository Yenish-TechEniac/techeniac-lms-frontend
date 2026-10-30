'use client';

import React, { useId, useRef } from 'react';

import { Button, type ButtonVariant } from '@/components/ui/Button';
import { H3, P, Span } from '@/components/ui/Typography';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';
import { cn } from '@/lib/cn';

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
  errorMessage?: string | null | undefined;
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
  errorMessage,
}: Readonly<ConfirmationModalProps>) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    isOpen,
    onClose,
    dialogRef,
  });

  if (!isOpen) return null;

  const isDanger = confirmVariant === 'danger';

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
        ref={dialogRef}
        role="alertdialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="animate-in fade-in zoom-in-95 w-full max-w-sm rounded-3xl border border-[#E1E6EC] bg-white p-6 text-center shadow-xl duration-150 focus:outline-none sm:p-7"
      >
        {/* Semantic Icon Circle (Amber for standard warning, Red for destructive danger) */}
        <div
          className={cn(
            'mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-white shadow-xs',
            isDanger ? 'bg-[#D92D20]' : 'bg-[#F79009]',
          )}
        >
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

        {/* Optional Error Alert */}
        {errorMessage ? (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2 text-xs font-semibold text-[#D92D20]"
          >
            {errorMessage}
          </div>
        ) : null}

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
            className={cn(
              'h-10 rounded-full px-6 text-xs font-semibold text-white',
              isDanger ? 'bg-[#D92D20] hover:bg-[#B42318]' : 'bg-[#0044D3] hover:bg-[#0036AB]',
            )}
          >
            <Span>{confirmLabel}</Span>
          </Button>
        </div>
      </div>
    </div>
  );
}
