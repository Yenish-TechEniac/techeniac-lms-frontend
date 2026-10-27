import React from 'react';

import { P } from '@/components/ui/Typography';
import { cn } from '@/lib/cn';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message?: string;
}

export function Alert({
  variant = 'error',
  title,
  message,
  children,
  className,
  ...props
}: Readonly<AlertProps>) {
  const styles = {
    error: 'border-red-300 bg-red-50/95 text-red-900',
    warning: 'border-amber-300 bg-amber-50/95 text-amber-900',
    info: 'border-blue-300 bg-blue-50/95 text-blue-900',
    success: 'border-emerald-300 bg-emerald-50/95 text-emerald-900',
  }[variant];

  const titleStyles = {
    error: 'text-red-950 font-semibold text-sm',
    warning: 'text-amber-950 font-semibold text-sm',
    info: 'text-blue-950 font-semibold text-sm',
    success: 'text-emerald-950 font-semibold text-sm',
  }[variant];

  const messageStyles = {
    error: 'text-red-800 font-normal',
    warning: 'text-amber-800 font-normal',
    info: 'text-blue-800 font-normal',
    success: 'text-emerald-800 font-normal',
  }[variant];

  return (
    <div
      role="alert"
      className={cn('rounded-xl border p-3.5 text-xs shadow-2xs', styles, className)}
      {...props}
    >
      {title ? <P className={titleStyles}>{title}</P> : null}
      {message ? (
        <P className={cn(title ? 'mt-1 text-xs' : 'text-xs', messageStyles, 'leading-relaxed')}>
          {message}
        </P>
      ) : null}
      {children}
    </div>
  );
}
