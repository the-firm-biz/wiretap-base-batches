import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/app/utils/cn';
import { textStyles } from '@/app/styles/template-strings/text-styles';

// Only for "default" variant
const colorMap: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground',
  blue: 'bg-blue-500/20 text-blue-500',
  red: 'bg-red-500/20 text-red-500',
  green: 'bg-green-500/20 text-green-600',
  yellow: 'bg-yellow-500/20 text-yellow-600'
};

const badgeVariants = cva(
  `${textStyles['code-01']} inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden`,
  {
    variants: {
      variant: {
        default: 'border-transparent', // color will be handled by colorMap
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    color?: keyof typeof colorMap;
  };

function Badge({
  className,
  variant = 'default',
  color = 'primary',
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';
  // Only apply color if variant is "default"
  const colorClass = variant === 'default' ? colorMap[color] : '';
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), colorClass, className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
