'use client';

import React from 'react';

import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, user, sessionError } = useRoleGuard('SUPER_ADMIN');

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Verifying administrative access..."
        spinnerColor="border-purple-600"
      />
    );
  }

  return <>{children}</>;
}
