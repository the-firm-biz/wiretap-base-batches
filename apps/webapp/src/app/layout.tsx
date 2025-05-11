import type { Metadata } from 'next';
/**
 @todo - if using this, we'll need to theme it https://docs.base.org/builderkits/onchainkit/installation/nextjs#add-styles
 */
import Providers from '@/app/components/providers';
import './styles/globals.css';
import { departureMono, ppMondwest, loRes12 } from './styles/font-family';
import { headers } from 'next/headers';
import './styles/lcd-grid.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://wiretap.thefirm.biz'),
  title: 'WireTap',
  description: "If you aren't first, you're last!",
  robots: 'index, follow'
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
        <Providers cookies={cookies}>
          <div className="flex flex-col min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
