import type { Metadata } from 'next';
import { Header } from '@/app/components/ui/header';
import PageContainer from '@/app/components/page-container';

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
    </>
  );
}
