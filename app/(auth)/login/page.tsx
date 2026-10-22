import type { Metadata } from 'next';

import { AuthShell } from '@/components/app/auth/AuthShell';
import { LoginForm } from '@/components/app/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | Techeniac LMS',
  description: 'Sign in with your organization credentials to access the learning platform.',
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Enter your organization credentials to resume your workspace."
    >
      <LoginForm />
    </AuthShell>
  );
}
