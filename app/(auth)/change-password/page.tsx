import type { Metadata } from 'next';

import { AuthShell } from '@/components/app/auth/AuthShell';
import { ChangePasswordForm } from '@/components/app/auth/ChangePasswordForm';

export const metadata: Metadata = {
  title: 'Change Temporary Password | Techeniac LMS',
  description: 'Update your temporary password on your first sign-in.',
};

export default function ChangePasswordPage() {
  return (
    <AuthShell
      title="Update temporary password"
      subtitle="For security, update the temporary password provided by your administrator."
    >
      <ChangePasswordForm />
    </AuthShell>
  );
}
