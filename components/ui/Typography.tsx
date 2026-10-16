import React from 'react';

export type TypographyVariant =
  'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'lead' | 'large' | 'small' | 'muted' | 'code';

export type TypographyElement =
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'small' | 'code' | 'blockquote';

const defaultElementMap: Record<TypographyVariant, TypographyElement> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'p',
  lead: 'p',
  large: 'div',
  small: 'small',
  muted: 'p',
  code: 'code',
};

export function getTypographyClassName(variant: TypographyVariant = 'p', className = ''): string {
  const variants: Record<TypographyVariant, string> = {
    h1: 'text-3xl font-bold tracking-tight text-foreground sm:text-4xl',
    h2: 'text-2xl font-semibold tracking-tight text-foreground',
    h3: 'text-xl font-semibold tracking-tight text-foreground',
    h4: 'text-lg font-semibold tracking-tight text-foreground',
    p: 'text-base leading-7 text-foreground',
    lead: 'text-lg leading-8 text-zinc-600 dark:text-zinc-400',
    large: 'text-lg font-semibold text-foreground',
    small: 'text-sm font-medium leading-none text-foreground',
    muted: 'text-sm text-zinc-600 dark:text-zinc-400',
    code: 'rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] font-semibold text-foreground dark:bg-white/[.08]',
  };

  return `${variants[variant]} ${className}`.trim();
}

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: TypographyElement;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className = '', variant = 'p', as, children, ...props }, ref) => {
    const Component = (as ?? defaultElementMap[variant]) as React.ElementType;

    return (
      <Component ref={ref} className={getTypographyClassName(variant, className)} {...props}>
        {children}
      </Component>
    );
  },
);

Typography.displayName = 'Typography';
