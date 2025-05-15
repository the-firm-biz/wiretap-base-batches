import { cn } from '../utils/cn';

export default function PageContainer({
  children,
  mainClassName,
  className
}: Readonly<{
  children: React.ReactNode;
  mainClassName?: string;
  className?: string;
}>) {
  return (
    <main
      className={cn('p-4 relative flex-1 h-full flex flex-col', mainClassName)}
    >
      <div
        className={cn(
          'max-w-screen-md w-full flex-1 h-full flex flex-col mx-auto',
          className
        )}
      >
        {children}
      </div>
    </main>
  );
}

{
  /*
    <main className="p-4 relative flex-1 h-full flex flex-col">
      <div
        className={cn(
          'max-w-screen-md w-full mx-auto flex-1 h-full flex flex-col',
          className
        )}
      >
 */
}
