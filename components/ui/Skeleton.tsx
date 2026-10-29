import React from 'react';

import { cn } from '@/lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly className?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-pulse rounded-xl bg-slate-200/80', className)}
      aria-hidden="true"
      {...props}
    />
  ),
);
Skeleton.displayName = 'Skeleton';
