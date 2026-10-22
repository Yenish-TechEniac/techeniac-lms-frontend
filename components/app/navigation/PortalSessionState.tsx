'use client';

import React from 'react';

import { useAuth } from '@/hooks/useAuth';

export interface PortalSessionStateProps {
  readonly sessionError: string | null;
  readonly loadingMessage: string;
  readonly spinnerColor?: string;
  readonly retryButtonColor?: string;
}

export function PortalSessionState({
  sessionError,
  loadingMessage,
  spinnerColor = 'border-blue-600',
  retryButtonColor = 'bg-blue-600 hover:bg-blue-700',
}: Readonly<PortalSessionStateProps>) {
  const { refreshUser } = useAuth();

  if (sessionError) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900">Session Verification Issue</h2>
          <p className="mt-2 text-sm text-slate-600">{sessionError}</p>
          <button
            type="button"
            onClick={() => {
              void refreshUser();
            }}
            className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${retryButtonColor}`}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 p-6">
      <div className="flex flex-col items-center gap-3">
        <div
          className={`h-8 w-8 animate-spin rounded-full border-4 border-t-transparent ${spinnerColor}`}
        />
        <p className="text-sm font-medium text-slate-500">{loadingMessage}</p>
      </div>
    </div>
  );
}
