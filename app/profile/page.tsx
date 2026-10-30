'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';

export default function ProfileRedirectPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'SUPER_ADMIN') {
      router.replace('/admin/profile');
    } else if (user.role === 'MENTOR') {
      router.replace('/mentor/profile');
    } else {
      router.replace('/mentee/profile');
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[#F6F8FC]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0044D3] border-t-transparent" />
    </div>
  );
}
