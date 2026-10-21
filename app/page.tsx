'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { getRolePortalPath } from '@/hooks/useRoleGuard';

export default function RootPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/login');
      } else if (user.mustChangePassword) {
        router.replace('/change-password');
      } else {
        router.replace(getRolePortalPath(user.role));
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Redirecting to your workspace...</p>
      </div>
    </div>
  );
}
