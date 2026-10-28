import type { Metadata } from 'next';
import React from 'react';

import { AuthShell } from '@/components/app/auth/AuthShell';
import { ForgotPasswordForm } from '@/components/app/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | Techeniac LMS',
  description: 'Request a password reset link for your account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot Password">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
