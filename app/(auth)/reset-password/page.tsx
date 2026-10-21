import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import { AuthShell } from '@/components/app/auth/AuthShell';
import { ResetPasswordForm } from '@/components/app/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Set New Password | Techeniac LMS',
  description: 'Create a new secure password for your account.',
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Create new password"
      subtitle="Ensure your new password meets the security requirements below."
    >
      <Suspense
        fallback={
          <div className="flex h-32 items-center justify-center text-sm text-slate-400">
            Loading...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
