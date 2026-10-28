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
      className={cn(
        'mt-1.5 flex items-center gap-1.5 text-sm font-medium text-[#D92D20]',
        className,
      )}
      {...props}
    >
      <svg
        className="h-4 w-4 shrink-0 text-[#D92D20]"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{error}</span>
    </p>
  );
}
