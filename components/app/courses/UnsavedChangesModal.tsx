'use client';

import React from 'react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesModal({ isOpen, onStay, onDiscard }: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <span className="text-xl font-bold">!</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Unsaved Changes Guard</h3>
            <p className="mt-1 text-sm text-slate-600">
              You have unsaved changes in this form. If you navigate away or switch nodes now, your
              edits will be discarded.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onStay}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Stay & Keep Editing
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}
