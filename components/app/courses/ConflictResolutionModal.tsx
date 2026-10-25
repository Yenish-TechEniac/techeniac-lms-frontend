'use client';

import React from 'react';

import { Button } from '@/components/ui/Button';
import { H3, P } from '@/components/ui/Typography';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onReload: () => void;
}

export function ConflictResolutionModal({ isOpen, onReload }: ConflictResolutionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <span className="text-xl font-bold">&times;</span>
          </div>
          <div className="flex-1">
            <H3 className="text-lg font-bold text-slate-900">Concurrent Edit Conflict (409)</H3>
            <P className="mt-1 text-sm text-slate-600">
              Another mentor or administrator has modified this item while you were editing. Your
              current version is out of date.
            </P>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900">
          <P className="leading-relaxed">
            To protect against accidental overwrites, please reload the latest version from the
            server and reapply your changes.
          </P>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            type="button"
            onClick={onReload}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 focus-visible:ring-slate-800 active:bg-slate-950"
          >
            Reload Latest Version Now
          </Button>
        </div>
      </div>
    </div>
  );
}
