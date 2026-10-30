'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

export interface SidebarContextValue {
  readonly isDrawerOpen: boolean;
  readonly setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly toggleDrawer: () => void;
  readonly openDrawer: () => void;
  readonly closeDrawer: () => void;
  readonly isMobileNavOpen: boolean;
  readonly setIsMobileNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly toggleMobileNav: () => void;
  readonly openMobileNav: () => void;
  readonly closeMobileNav: () => void;
  readonly contentMarginClass: string;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export interface SidebarProviderProps {
  readonly children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  // Desktop persistent drawer: expanded by default (true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  // Mobile / Tablet overlay drawer: closed by default (false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const toggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);
  const openMobileNav = () => setIsMobileNavOpen(true);
  const closeMobileNav = () => setIsMobileNavOpen(false);

  // Desktop (lg): w-72 (expanded) or w-20 (rail). Tablet (md): w-20 rail. Mobile: ml-0.
  const contentMarginClass = isDrawerOpen ? 'lg:ml-72 md:ml-20' : 'lg:ml-20 md:ml-20';

  const value = useMemo<SidebarContextValue>(
    () => ({
      isDrawerOpen,
      setIsDrawerOpen,
      toggleDrawer,
      openDrawer,
      closeDrawer,
      isMobileNavOpen,
      setIsMobileNavOpen,
      toggleMobileNav,
      openMobileNav,
      closeMobileNav,
      contentMarginClass,
    }),
    [isDrawerOpen, isMobileNavOpen, contentMarginClass],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    return {
      isDrawerOpen: true,
      setIsDrawerOpen: () => {},
      toggleDrawer: () => {},
      openDrawer: () => {},
      closeDrawer: () => {},
      isMobileNavOpen: false,
      setIsMobileNavOpen: () => {},
      toggleMobileNav: () => {},
      openMobileNav: () => {},
      closeMobileNav: () => {},
      contentMarginClass: 'lg:ml-72 md:ml-20',
    };
  }
  return ctx;
}
