import React from 'react';

import { cn } from '@/lib/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  readonly hasError?: boolean;
  readonly errorId?: string;
  readonly containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      containerClassName = '',
      hasError = false,
      errorId,
      'aria-describedby': ariaDescribedBy,
      id,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const errorDescribedBy = errorId ?? (id ? `${id}-error` : undefined);
    const resolvedDescribedBy = hasError
      ? [ariaDescribedBy, errorDescribedBy].filter(Boolean).join(' ') || undefined
      : ariaDescribedBy;

    return (
      <div className={cn('relative w-full', containerClassName)}>
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={resolvedDescribedBy}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border pr-10 pl-3.5 text-sm font-semibold transition-all duration-150',
            'bg-white text-slate-900',
            'cursor-pointer focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-70',
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-200',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  },
);

Select.displayName = 'Select';
