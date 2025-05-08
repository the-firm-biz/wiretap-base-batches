import type { Metadata } from 'next';
import { Header } from '@/app/components/header';

export const metadata: Metadata = {
  metadataBase: new URL('https://wiretap.thefirm.biz'),
  title: 'Wallet | WireTap',
  description: 'Blah blah blah',
  robots: 'index, follow'
};

export default function WalletPageLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header
        pageTitle="Wallet"
        headerClassName="bg-accent"
        pageTitleClassName="text-accent-foreground"
      />
      <main className="flex-1">{children}</main>
    </>
  );
}
