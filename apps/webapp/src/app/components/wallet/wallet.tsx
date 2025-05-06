'use client';

import { useWalletClient } from 'wagmi';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { formatAddress } from '@/app/utils/format/format-address';
import { createSessionKeyForUserWallet } from '@/app/utils/kernel/create-session-key-for-user-wallet';
import { Button } from '../ui/button';

export function Wallet() {
  const { open } = useAppKit();
  const { isConnected, status, address } = useAppKitAccount();
  const walletClientQuery = useWalletClient();

  const walletClient = walletClientQuery.data;
  const buttonText = !isConnected ? 'Connect' : status;

  // @todo session keys - this is just a way to test the function.
  const handleCreateSessionKey = async () => {
    const serializedSessionKey = await createSessionKeyForUserWallet(
      walletClient!
    );
    console.log({ serializedSessionKey });
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => handleCreateSessionKey()} disabled={!walletClient}>
        Create Session Key
      </Button>
      <Button onClick={() => open()}>{buttonText}</Button>
      <div className="flex flex-col items-center gap-2">
        {address && <span>{formatAddress(address)}</span>}
      </div>
    </div>
  );
}
