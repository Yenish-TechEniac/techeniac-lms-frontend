import React from 'react';

import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  isLoading?: boolean | undefined;
}

function isButtonSize(value: string): value is ButtonSize {
  return value === 'sm' || value === 'md' || value === 'lg';
}

export function getButtonClassName(variant?: ButtonVariant, className?: string): string;
export function getButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
): string;
export function getButtonClassName(
  variant: ButtonVariant = 'primary',
  sizeOrClassName = 'md',
  className?: string,
): string {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-[#0044D3] text-white shadow-xs hover:bg-[#0039B3] active:bg-[#002FA0] focus-visible:ring-[#0044D3]',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400',
    outline:
      'border border-[#E1E6EC] bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-400',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
    danger:
      'bg-red-600 text-white shadow-xs hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-4 text-xs rounded-full',
    md: 'h-11 px-5 text-sm rounded-full',
    lg: 'h-12 px-7 text-base rounded-full',
  };

  const isSize = isButtonSize(sizeOrClassName);
  const size: ButtonSize = isSize ? sizeOrClassName : 'md';
  let extraClass: string | undefined;
  if (isSize) {
    extraClass = className;
  } else {
    extraClass = sizeOrClassName;
  }

  return cn(base, variants[variant], sizes[size], extraClass);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      type = 'button',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={getButtonClassName(variant, size, className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-5 w-5 animate-spin text-current"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
