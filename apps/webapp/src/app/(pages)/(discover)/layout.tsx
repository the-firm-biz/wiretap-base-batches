import type { Metadata } from 'next';
import { Header } from '@/app/components/header';
import PageContainer from '@/app/components/page-container';
import { Footer } from '@/app/components/footer/footer';
import { ConnectedWalletGate } from '@/app/components/connected-wallet-gate/connected-wallet-gate';

export const metadata: Metadata = {
  metadataBase: new URL('https://wiretap.thefirm.biz'),
  title: 'Discover | WireTap',
  description:
    'Automatically snap up new tokens from social accounts you follow — before regular schmucks even know they’ve launched.',
  robots: 'index, follow',
  openGraph: {
    title: 'Discover | WireTap',
    description:
      'Automatically snap up new tokens from social accounts you follow — before regular schmucks even know they’ve launched.',
    images: [
      {
        url: '/wiretap-meta-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'WireTap'
      }
    ]
  },
  icons: {
    icon: '/favicon.ico'
  }
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
      <Footer currentPagePath="/" />
    </ConnectedWalletGate>
  );
}
