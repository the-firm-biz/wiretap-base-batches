import * as React from 'react';
import { cn } from '@/app/utils';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  children?: React.ReactNode;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, children, ...props }, ref) => (
    <svg viewBox="0 0 32 32" className={cn(className)} ref={ref} {...props}>
      {children}
    </svg>
  )
);
Icon.displayName = 'Icon';
