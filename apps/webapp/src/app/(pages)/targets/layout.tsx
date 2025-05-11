import type { Metadata } from 'next';
import { Header } from '@/app/components/header';
import PageContainer from '@/app/components/page-container';
import { Footer } from '@/app/components/footer/footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://wiretap.thefirm.biz'),
  title: 'Targets | WireTap',
  description: 'Blah blah blah',
  robots: 'index, follow'
};

export default function TargetsLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header pageTitle="Targets" />
      <PageContainer>{children}</PageContainer>
      <Footer currentPagePath="targets" />
    </>
  );
}
