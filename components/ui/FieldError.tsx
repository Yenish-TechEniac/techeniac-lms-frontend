import React from 'react';

import { cn } from '@/lib/cn';

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  readonly error?: string | null | undefined;
}

export function FieldError({ error, className, id, ...props }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn('mt-1 text-xs font-medium text-red-700', className)}
      {...props}
    >
      {error}
    </p>
  );
}
