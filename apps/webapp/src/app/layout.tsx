import type { Metadata } from 'next';
/**
 @todo - if using this, we'll need to theme it https://docs.base.org/builderkits/onchainkit/installation/nextjs#add-styles
 */
import Providers from '@/app/components/providers';
import { Header } from '@/app/components/ui/header';
import './styles/globals.css';
import { departureMono, ppMondwest, loRes12 } from './styles/font-family';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/app/components/providers/theme-provider';

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ppMondwest.variable} ${loRes12.variable} ${departureMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Providers cookies={cookies}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
