import React from 'react';

import { cn } from '@/lib/cn';

export interface PasswordVisibilityToggleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'children'
> {
  readonly visible?: boolean;
  readonly isVisible?: boolean;
  readonly onToggle: () => void;
  readonly className?: string;
}

export function PasswordVisibilityToggle({
  visible,
  isVisible,
  onToggle,
  className,
  ...props
}: Readonly<PasswordVisibilityToggleProps>) {
  const isRevealed = Boolean(visible ?? isVisible);
  const label = isRevealed ? 'Hide password' : 'Show password';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'absolute top-1/2 right-2.5 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500',
        className,
      )}
      title={label}
      aria-label={label}
      {...props}
    >
      {isRevealed ? (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      )}
    </button>
  );
}
