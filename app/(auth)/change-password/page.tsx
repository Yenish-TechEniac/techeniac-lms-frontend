'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { AuthShell } from '@/components/app/auth/AuthShell';
import { ChangePasswordForm } from '@/components/app/auth/ChangePasswordForm';
import { useAuth } from '@/hooks/useAuth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      title="Update temporary password"
      subtitle="For security, update the temporary password provided by your administrator."
    >
      <ChangePasswordForm />
    </AuthShell>
  );
}
