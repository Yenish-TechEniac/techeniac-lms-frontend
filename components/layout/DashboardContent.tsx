'use client';

import React from 'react';

import { useSidebar } from '@/context/SidebarContext';

export interface DashboardContentProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function DashboardContent({ children, className = '' }: DashboardContentProps) {
  const { isDrawerOpen } = useSidebar();

  return (
    <main
      className={`min-w-0 flex-1 px-6 py-8 transition-all duration-300 sm:px-8 lg:px-10 ${
        isDrawerOpen ? 'md:ml-72' : 'md:ml-20'
      } ${className}`}
    >
      {children}
    </main>
  );
}
