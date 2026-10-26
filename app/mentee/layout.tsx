'use client';

import React from 'react';

import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function MenteeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  useRoleGuard('MENTEE');

  return <>{children}</>;
}
