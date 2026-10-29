import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import { AuthShell } from '@/components/app/auth/AuthShell';
import { ResetPasswordForm } from '@/components/app/auth/ResetPasswordForm';
import { Span } from '@/components/ui/Typography';

export const metadata: Metadata = {
  title: 'Reset Password | Techeniac LMS',
  description: 'Create a new secure password for your account.',
};

export default function ResetPasswordPage() {
  const resetPasswordFooter = (
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
      <Span>Please choose a strong, unique password to secure your Techeniac LMS account.</Span>
    </div>
  );

  return (
    <AuthShell title="Create A New Password" footerContent={resetPasswordFooter}>
      <Suspense
        fallback={<div className="py-6 text-center text-sm text-slate-500">Loading...</div>}
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
