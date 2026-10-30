import Link from 'next/link';
import React from 'react';

import { P, PageTitle, Span } from '@/components/ui/Typography';

export interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
  readonly active?: boolean;
}

/**
 * Standard PageHeader pattern props.
 * `breadcrumbs` and `subtitle` are standard forward-compatible design props
 * for modular navigation across LMS pages.
 */
export interface PageHeaderProps {
  readonly breadcrumbs?: readonly BreadcrumbItem[];
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: React.ReactNode;
  readonly className?: string;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`pt-2 sm:pt-3 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={b.label}>
                  {i > 0 && <Span className="text-slate-300">/</Span>}
                  {b.href && !b.active ? (
                    <Link href={b.href} className="transition-colors hover:text-[#0044D3]">
                      {b.label}
                    </Link>
                  ) : (
                    <Span className={b.active ? 'text-[#0044D3]' : ''}>{b.label}</Span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : null}
          <PageTitle>{title}</PageTitle>
          {subtitle ? <P className="mt-1 text-sm text-slate-500">{subtitle}</P> : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:gap-3">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
