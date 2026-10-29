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
          'bg-white text-[#111827] placeholder:text-[#667085]',
          'border-[#E1E6EC] focus:border-[#0044D3] focus:ring-4 focus:ring-blue-100 focus:outline-none',
          className,
          hasError && 'border-[#D92D20]! ring-4! ring-[#D92D20]/15! focus:border-[#D92D20]!',
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
