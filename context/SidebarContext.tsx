'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

export interface SidebarContextValue {
  readonly isDrawerOpen: boolean;
  readonly setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly toggleDrawer: () => void;
  readonly openDrawer: () => void;
  readonly closeDrawer: () => void;
  readonly contentMarginClass: string;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export interface SidebarProviderProps {
  readonly children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  // Collapsed by default on desktop to showcase the icon rail matching LeadNest Figma design
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const contentMarginClass = isDrawerOpen ? 'md:ml-72' : 'md:ml-20';

  const value = useMemo<SidebarContextValue>(
    () => ({
      isDrawerOpen,
      setIsDrawerOpen,
      toggleDrawer,
      openDrawer,
      closeDrawer,
      contentMarginClass,
    }),
    [isDrawerOpen, contentMarginClass],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    return {
      isDrawerOpen: false,
      setIsDrawerOpen: () => {},
      toggleDrawer: () => {},
      openDrawer: () => {},
      closeDrawer: () => {},
      contentMarginClass: 'md:ml-20',
    };
  }
  return ctx;
}
