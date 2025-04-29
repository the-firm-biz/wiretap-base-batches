'use client';

import { Button } from '../ui/button';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

export function Wallet() {
  const { open } = useAppKit();
  const { isConnected, status } = useAppKitAccount();

  const buttonText = !isConnected ? 'Connect' : status;

  return <Button onClick={() => open()}>{buttonText}</Button>;
}
