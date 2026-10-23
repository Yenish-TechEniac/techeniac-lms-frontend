'use client';

import React from 'react';

import { Button } from '@/components/ui/Button';
import { H2, P } from '@/components/ui/Typography';
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
}: Readonly<PortalSessionStateProps>) {
  const { refreshUser } = useAuth();

  if (sessionError) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xs">
          <H2 className="text-lg font-bold text-slate-900">Session Verification Issue</H2>
          <P className="mt-2 text-sm text-slate-600">{sessionError}</P>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              void refreshUser();
            }}
            className="mt-4"
          >
            Retry Connection
          </Button>
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
        <P className="text-sm font-medium text-slate-500">{loadingMessage}</P>
      </div>
    </div>
  );
}
