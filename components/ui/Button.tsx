import React from 'react';

export type ButtonVariant = 'primary' | 'secondary';

export function getButtonClassName(variant: ButtonVariant = 'primary', className = ''): string {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-foreground text-background hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:ring-foreground',
    secondary:
      'border border-zinc-300 bg-transparent text-foreground hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 focus-visible:ring-zinc-400',
  };

  return `${base} ${variants[variant]} ${className}`.trim();
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', type = 'button', children, ...props }, ref) => {
    return (
      <button ref={ref} type={type} className={getButtonClassName(variant, className)} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
