export default function PageContainer({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="p-4 relative max-w-screen-md w-full mx-auto flex-1 h-full flex flex-col">
      {children}
    </main>
  );
}
