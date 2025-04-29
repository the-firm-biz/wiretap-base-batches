'use client';

import { Wallet } from '@/app/components/wallet/wallet';

export function Header() {
  return (
    <header className="w-full h-[60px] py-4 px-6 flex items-center justify-between border-b">
      <div className="flex items-center" />

      <div className="flex items-center">
        <Wallet />
      </div>
    </header>
  );
}
