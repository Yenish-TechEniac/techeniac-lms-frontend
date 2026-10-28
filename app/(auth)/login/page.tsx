import type { Metadata } from 'next';
import React from 'react';

import { AuthShell } from '@/components/app/auth/AuthShell';
import { LoginForm } from '@/components/app/auth/LoginForm';
import { Span } from '@/components/ui/Typography';

export const metadata: Metadata = {
  title: 'Sign In | Techeniac LMS',
  description: 'Sign in with your organization credentials to access the learning platform.',
};

export default function LoginPage() {
  const loginFooter = (
    <div className="pt-2 text-center">
      <Span className="text-xs text-slate-500">
        New to Techeniac LMS?{' '}
        <Span className="font-semibold text-[#0044D3]">Contact Administrator</Span>
      </Span>
    </div>
  );

  return (
    <AuthShell title="Welcome Back" footerContent={loginFooter}>
      <LoginForm />
    </AuthShell>
  );
}
