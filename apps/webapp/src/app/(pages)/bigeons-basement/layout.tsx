import type { Metadata } from 'next';
import { Header } from '@/app/components/header';
import PageContainer from '@/app/components/page-container';
import { Footer } from '@/app/components/footer/footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://wiretap.thefirm.biz'),
  title: "Bigeon's Basement | WireTap",
  description: "Are you brave enough to enter... Bigeon's Basement",
  robots: 'index, follow'
};

export default function BigeonsBasementLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header pageTitle="Bigeon's Homepage" />
      <PageContainer>{children}</PageContainer>
      <Footer currentPagePath="targets" />
    </>
  );
}
