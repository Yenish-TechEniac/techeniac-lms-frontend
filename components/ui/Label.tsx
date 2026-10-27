import React from 'react';

import { Span } from '@/components/ui/Typography';
import { cn } from '@/lib/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required = false, children, className, ...props }: LabelProps) {
  return (
    <label className={cn('block text-sm font-semibold text-slate-900', className)} {...props}>
      {children}
      {required ? <Span className="text-red-500"> *</Span> : null}
    </label>
  );
}
