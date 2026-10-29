'use client';

import React from 'react';

import { useSidebar } from '@/context/SidebarContext';

export interface DashboardContentProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function DashboardContent({ children, className = '' }: DashboardContentProps) {
  const { contentMarginClass } = useSidebar();

  return (
    <main
      className={`min-w-0 flex-1 px-6 py-8 transition-all duration-300 sm:px-8 lg:px-10 ${contentMarginClass} ${className}`}
    >
      {children}
    </main>
  );
}
