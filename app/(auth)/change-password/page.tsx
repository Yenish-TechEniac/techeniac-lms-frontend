'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { AuthShell } from '@/components/app/auth/AuthShell';
import { ChangePasswordForm } from '@/components/app/auth/ChangePasswordForm';
import { P, Span } from '@/components/ui/Typography';
import { redirectUserByRole, useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isAuthorized } = useRoleRedirect({ allowMustChangePassword: true });

  useEffect(() => {
    if (user && !user.mustChangePassword) {
      redirectUserByRole(router, user);
    }
  }, [user, router]);

  if (!isAuthorized || (user && !user.mustChangePassword)) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-900/90 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <P className="text-sm font-medium text-slate-300">Loading...</P>
        </div>
      </div>
    );
  }

  const changePasswordFooter = (
    <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-500">
      <svg
        className="h-4 w-4 shrink-0 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <Span>
        You&apos;re using a temporary password. Please create a new password to secure your
        Techeniac LMS account.
      </Span>
    </div>
  );

  return (
    <AuthShell title="Create A New Password" footerContent={changePasswordFooter}>
      <ChangePasswordForm />
    </AuthShell>
  );
}
