'use client';

import React from 'react';

import { ADMIN_PROFILE_NAV } from '@/components/app/navigation/portal-nav.config';
import { PortalSessionState } from '@/components/app/navigation/PortalSessionState';
import { ProfileView } from '@/components/app/profile/ProfileView';
import { DashboardContent } from '@/components/layout/DashboardContent';
import { Header } from '@/components/layout/Header';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function AdminProfilePage() {
  const { user, isAuthorized, sessionError } = useRoleRedirect({ allowedRoles: ['SUPER_ADMIN'] });

  if (!isAuthorized || !user) {
    return (
      <PortalSessionState
        sessionError={sessionError}
        loadingMessage="Loading admin profile..."
        variant="admin"
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F8FC] text-[#111827]">
      <Header {...ADMIN_PROFILE_NAV} />
      <DashboardContent>
        <ProfileView user={user} />
      </DashboardContent>
    </div>
  );
}
