import React from 'react';

import { cn } from '@/lib/cn';

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string | null | undefined;
}

export function FieldError({ error, className, ...props }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p
      role="alert"
      aria-live="polite"
      className={cn('mt-1 text-xs font-medium text-red-700', className)}
      {...props}
    >
      {error}
    </p>
  );
}
