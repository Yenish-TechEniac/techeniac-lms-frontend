'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { useAuth } from '@/hooks/useAuth';
import { getRoleProfilePath } from '@/hooks/useRoleRedirect';

export default function ProfileRedirectPage() {
  const { user, isAuthenticated, isLoading, sessionError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      if (sessionError) return;
      router.replace('/login');
      return;
    }

    if (user.mustChangePassword) {
      router.replace('/change-password');
      return;
    }

    router.replace(getRoleProfilePath(user.role));
  }, [user, isAuthenticated, isLoading, sessionError, router]);

  if (sessionError && (!isAuthenticated || !user)) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading profile..."
        variant="admin"
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[#F6F8FC]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0044D3] border-t-transparent" />
    </div>
  );
}
