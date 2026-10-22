import type { Metadata } from 'next';

import { AuthShell } from '@/components/app/auth/AuthShell';
import { ForgotPasswordForm } from '@/components/app/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | Techeniac LMS',
  description: 'Request a password reset link for your account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your verified work email address to receive a secure password reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
