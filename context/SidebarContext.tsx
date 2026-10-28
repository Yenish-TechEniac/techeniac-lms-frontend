'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

export interface SidebarContextValue {
  readonly isDrawerOpen: boolean;
  readonly setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly toggleDrawer: () => void;
  readonly openDrawer: () => void;
  readonly closeDrawer: () => void;
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

  const value = useMemo<SidebarContextValue>(
    () => ({
      isDrawerOpen,
      setIsDrawerOpen,
      toggleDrawer,
      openDrawer,
      closeDrawer,
    }),
    [isDrawerOpen],
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
    };
  }
  return ctx;
}
