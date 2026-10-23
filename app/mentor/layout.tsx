'use client';

import React from 'react';

import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, user, sessionError } = useRoleGuard('MENTOR');

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Verifying mentor credentials..."
        spinnerColor="border-emerald-600"
      />
    );
  }

  return <>{children}</>;
}
