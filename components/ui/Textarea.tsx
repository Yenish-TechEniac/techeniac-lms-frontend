import React from 'react';

import { cn } from '@/lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly hasError?: boolean;
  readonly errorId?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      hasError = false,
      errorId,
      'aria-describedby': ariaDescribedBy,
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
      <textarea
        ref={ref}
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={resolvedDescribedBy}
        className={cn(
          'w-full rounded-xl border p-3 text-sm leading-relaxed transition-all duration-150',
          'bg-white text-slate-900 placeholder:text-slate-400',
          'focus:ring-4 focus:outline-none',
          'disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-70',
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

Textarea.displayName = 'Textarea';
