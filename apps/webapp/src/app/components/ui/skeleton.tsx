import { cn } from '@/app/utils/cn';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent/40 animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
