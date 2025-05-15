import { cn } from '../utils/cn';

export default function PageContainer({
  children,
  className
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <main className="p-4 relative flex-1 h-full flex flex-col">
      <div
        className={cn(
          'max-w-screen-md w-full mx-auto flex-1 h-full flex flex-col',
          className
        )}
      >
        {children}
      </div>
    </main>
  );
}
