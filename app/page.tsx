'use client';

import React from 'react';

import { P } from '@/components/ui/Typography';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function RootPage() {
  useRoleRedirect({ redirectAuthenticatedToPortal: true });

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <P className="text-sm font-medium text-slate-500">Redirecting to your workspace...</P>
      </div>
    </div>
  );
}
