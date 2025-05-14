import type { Metadata } from 'next';
import { Header } from '@/app/components/header';
import PageContainer from '@/app/components/page-container';
import { Footer } from '@/app/components/footer/footer';
import { ConnectedWalletGate } from '@/app/components/connected-wallet-gate/connected-wallet-gate';
export const metadata: Metadata = {
  metadataBase: new URL('https://wiretap.thefirm.biz'),
  title: 'Targets | WireTap',
  description:
    'Your targets: accounts and addresses of interest. WireTap listens in on their on-chain activity and snaps up any tokens they launch in a flash.',
  robots: 'index, follow',
  openGraph: {
    title: 'Targets | WireTap',
    description:
      'Your targets: accounts and addresses of interest. WireTap listens in on their on-chain activity and snaps up any tokens they launch in a flash.',
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

export default function TargetsLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConnectedWalletGate>
      <Header pageTitle="Targets" />
      <PageContainer>{children}</PageContainer>
      <Footer currentPagePath="targets" />
    </ConnectedWalletGate>
  );
}
