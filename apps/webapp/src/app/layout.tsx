import type { Metadata } from 'next';
/**
 @todo - if using this, we'll need to theme it https://docs.base.org/builderkits/onchainkit/installation/nextjs#add-styles
 */
import Providers from '@/app/components/providers';
import './styles/globals.css';
import { departureMono, ppMondwest, loRes12 } from './styles/font-family';
import { headers } from 'next/headers';
import { Toaster } from './components/ui/sonner';

export const generateMetadata = (): Metadata => {
  return {
    metadataBase: new URL('https://wiretap.thefirm.biz'),
    title: 'WireTap',
    description:
      'Automatically snap up new tokens from social accounts you follow — before regular schmucks even know they’ve launched.',
    robots: 'index, follow',
    other: {
      /** https://miniapps.farcaster.xyz/docs/specification#schema */
      'fc:frame': JSON.stringify({
        version: 'next',
        imageUrl: 'https://wiretap.thefirm.biz/wiretap-meta-1200x800.png',
        button: {
          title: 'Launch WireTap',
          action: {
            type: 'launch_frame',
            name: 'WireTap',
            url: 'https://wiretap.thefirm.biz',
            splashImageUrl:
              'https://wiretap.thefirm.biz/wiretap-social-pfp-200.png',
            splashBackgroundColor: '#7a8d7e'
          }
        }
      })
    }
  };
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  // `suppressHydrationWarning` is recommended in the official docs
  // https://github.com/pacocoursey/next-themes
  // > Note! If you do not add suppressHydrationWarning to your <html>
  // > you will get warnings because next-themes updates that element.
  // > This property only applies one level deep, so it won't block hydration
  // > warnings on other elements.
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ppMondwest.variable} ${loRes12.variable} ${departureMono.variable} antialiased`}
      >
        <div className="lcd-grid-overlay" aria-hidden="true"></div>
        <Toaster />
        <Providers cookies={cookies}>
          <div className="flex flex-col min-h-dvh">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
