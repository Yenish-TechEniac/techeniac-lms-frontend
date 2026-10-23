'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Span } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';

export interface HeaderNavItem {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
}

export interface HeaderProps {
  readonly subtitle?: string;
  readonly homeUrl?: string;
  readonly badgeColor?: string;
  readonly nav?: readonly HeaderNavItem[];
}

export function Header({
  subtitle = 'Learning Platform',
  homeUrl = '/',
  badgeColor = 'bg-blue-100 text-blue-800',
  nav = [],
}: Readonly<HeaderProps>) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not sign out. Please check your connection and try again.';
      setLogoutError(msg);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href={homeUrl} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
              TL
            </div>
            <div className="flex flex-col">
              <Span className="text-sm font-bold tracking-tight text-slate-900">Techeniac LMS</Span>
              <Span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                {subtitle}
              </Span>
            </div>
          </Link>

          {/* Navigation Links */}
          {nav.length > 0 ? (
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => {
                if (item.active) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  );
                }
                if (item.href !== '#') {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <Span
                    key={item.label}
                    className="cursor-not-allowed rounded-md px-3 py-1.5 text-xs font-medium text-slate-400"
                  >
                    {item.label}
                  </Span>
                );
              })}
            </nav>
          ) : null}
        </div>

        {/* User Info & Actions */}
        <div className="relative flex items-center gap-3">
          {logoutError ? (
            <div
              role="alert"
              className="absolute top-12 right-0 z-50 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 shadow-lg"
            >
              <Span>{logoutError}</Span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLogoutError(null)}
                className="h-6 w-6 p-0 font-bold text-red-500 hover:text-red-800"
                aria-label="Dismiss error"
              >
                ×
              </Button>
            </div>
          ) : null}
          {user ? (
            <div className="hidden flex-col text-right sm:flex">
              <Span className="text-xs font-semibold text-slate-800">{user.name}</Span>
              <Span className="text-[10px] text-slate-500">{user.email}</Span>
            </div>
          ) : null}

          {user ? (
            <Span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badgeColor}`}
            >
              {user.role}
            </Span>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void handleLogout();
            }}
            disabled={isLoggingOut}
            isLoading={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </div>
    </header>
  );
}
