import React from 'react';

import { cn } from '@/lib/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  readonly hasError?: boolean;
  readonly errorId?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      hasError = false,
      errorId,
      'aria-describedby': ariaDescribedBy,
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const errorDescribedBy = errorId ?? (id ? `${id}-error` : undefined);
    const resolvedDescribedBy = hasError
      ? [ariaDescribedBy, errorDescribedBy].filter(Boolean).join(' ') || undefined
      : ariaDescribedBy;

    return (
      <select
        ref={ref}
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={resolvedDescribedBy}
        className={cn(
          'h-11 w-full rounded-xl border px-3 text-sm font-semibold transition-all duration-150',
          'bg-white text-slate-900',
          'focus:ring-4 focus:outline-none',
          'disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-70',
          hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = 'Select';
