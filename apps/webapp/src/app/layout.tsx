import type { Metadata } from 'next';
/**
 @todo - if using this, we'll need to theme it https://docs.base.org/builderkits/onchainkit/installation/nextjs#add-styles
 */
import Providers from '@/app/components/providers';
import { Header } from '@/app/components/ui/header';
import './styles/globals.css';
import { departureMono, ppMondwest, loRes12 } from './styles/font-family';
import { headers } from 'next/headers';

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

  return (
    <html lang="en">
      <body
        className={`${ppMondwest.variable} ${loRes12.variable} ${departureMono.variable} antialiased`}
      >
        <Providers cookies={cookies}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
