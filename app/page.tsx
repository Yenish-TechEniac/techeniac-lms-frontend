'use client';

import React from 'react';

import { useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function RootPage() {
  useRoleRedirect({ redirectAuthenticatedToPortal: true });

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[#F6F8FC]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0044D3] border-t-transparent" />
    </div>
  );
}
