import React from 'react';

import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly hasError?: boolean;
  readonly errorId?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      hasError = false,
      errorId,
      'aria-describedby': ariaDescribedBy,
      type = 'text',
      id,
      ...props
    },
    ref,
  ) => {
    const errorDescribedBy = errorId ?? (id ? `${id}-error` : undefined);
    const resolvedDescribedBy = hasError
      ? [ariaDescribedBy, errorDescribedBy].filter(Boolean).join(' ') || undefined
      : ariaDescribedBy;

    return (
      <input
        ref={ref}
        id={id}
        type={type}
        aria-invalid={hasError || undefined}
        aria-describedby={resolvedDescribedBy}
        className={cn(
          'h-12 w-full rounded-xl border px-4 text-base transition-all duration-150',
          'bg-white text-slate-900 placeholder:text-slate-400',
          'focus:ring-4 focus:outline-none',
          hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
