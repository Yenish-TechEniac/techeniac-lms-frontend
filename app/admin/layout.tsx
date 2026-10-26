'use client';

import React from 'react';

import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  useRoleGuard('SUPER_ADMIN');

  return <>{children}</>;
}
