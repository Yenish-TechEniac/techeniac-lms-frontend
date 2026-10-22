import React from 'react';

import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  isLoading?: boolean | undefined;
}

export function getButtonClassName(variant?: ButtonVariant, className?: string): string;
export function getButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
): string;
export function getButtonClassName(
  variant: ButtonVariant = 'primary',
  sizeOrClassName: unknown = 'md',
  className?: string,
): string {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-blue-500 text-white shadow-sm shadow-blue-500/25 hover:bg-blue-600 active:bg-blue-700 focus-visible:ring-blue-500',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400',
    outline:
      'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-400',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-3 text-xs rounded-lg',
    md: 'h-11 px-4 text-sm rounded-xl',
    lg: 'h-12 px-6 text-base rounded-xl',
  };

  const isSize = sizeOrClassName === 'sm' || sizeOrClassName === 'md' || sizeOrClassName === 'lg';
  const size: ButtonSize = isSize ? sizeOrClassName : 'md';
  const extraClass = isSize
    ? className
    : typeof sizeOrClassName === 'string'
      ? sizeOrClassName
      : undefined;

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
