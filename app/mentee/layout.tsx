'use client';

import React from 'react';

import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function MenteeLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, user, sessionError } = useRoleGuard('MENTEE');

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Verifying mentee workspace access..."
        spinnerColor="border-blue-600"
      />
    );
  }

  return <>{children}</>;
}
