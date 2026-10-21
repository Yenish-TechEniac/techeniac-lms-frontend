import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Change Temporary Password | Techeniac LMS',
  description: 'Update your temporary password on your first sign-in.',
};

export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
