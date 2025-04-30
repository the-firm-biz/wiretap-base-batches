'use client';

import { formatAddress } from '@/app/utils/format/format-address';
import { Button } from '../ui/button';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

export function Wallet() {
  const { open } = useAppKit();
  const { isConnected, status, address } = useAppKitAccount();

  const buttonText = !isConnected ? 'Connect' : status;

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => open()}>{buttonText}</Button>
      {address && <span>{formatAddress(address)}</span>}
    </div>
  );
}
