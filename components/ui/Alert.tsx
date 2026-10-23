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
}: AlertProps) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }[variant];

  return (
    <div
      role="alert"
      className={cn('rounded-xl border p-3.5 text-xs', styles, className)}
      {...props}
    >
      {title ? <P className="font-semibold text-slate-900">{title}</P> : null}
      {message ? <P className={title ? 'mt-1 text-xs' : 'text-xs'}>{message}</P> : null}
      {children}
    </div>
  );
}
