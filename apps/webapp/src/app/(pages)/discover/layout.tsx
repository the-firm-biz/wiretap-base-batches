import type { Metadata } from 'next';
import { Header } from '@/app/components/header';
import PageContainer from '@/app/components/page-container';
import { Footer } from '@/app/components/footer/footer';
import { ConnectedWalletGate } from '@/app/components/connected-wallet-gate/connected-wallet-gate';

export const metadata: Metadata = {
  metadataBase: new URL('https://wiretap.thefirm.biz'),
  title: 'Discover | WireTap',
  description: 'Blah blah blah',
  robots: 'index, follow'
};

export default function DiscoverLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConnectedWalletGate>
      <Header pageTitle="Discover" />
      <PageContainer>{children}</PageContainer>
      <Footer currentPagePath="discover" />
    </ConnectedWalletGate>
  );
}
