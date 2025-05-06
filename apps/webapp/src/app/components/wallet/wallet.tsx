'use client';

import { useWalletClient } from 'wagmi';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { formatAddress } from '@/app/utils/format/format-address';
import { createSessionKeyForUserWallet } from '@/app/utils/kernel/create-session-key-for-user-wallet';
import { useTRPCClient } from '@/app/trpc-clients/trpc-react-client';
import { Button } from '../ui/button';
import { useState } from 'react';

export function Wallet() {
  const { open } = useAppKit();
  const { isConnected, status, address } = useAppKitAccount();
  const walletClientQuery = useWalletClient();
  const trpc = useTRPCClient();
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const walletClient = walletClientQuery.data;
  const buttonText = !isConnected ? 'Connect' : status;

  const handleCreateSessionKey = async () => {
    if (!walletClient || !address) return;

    try {
      setIsCreatingSession(true);

      const serializedSessionKey =
        await createSessionKeyForUserWallet(walletClient);

      const result = await trpc.session.createWireTapSession.mutate({
        serializedSessionKey
      });

      console.log('Session key created successfully:', result);
    } catch (error) {
      console.error('Failed to create session key:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleCreateSessionKey()}
        disabled={!walletClient || isCreatingSession}
      >
        {isCreatingSession ? 'Creating...' : 'Create Session Key'}
      </Button>
      <Button onClick={() => open()}>{buttonText}</Button>
      <div className="flex flex-col items-center gap-2">
        {address && <span>{formatAddress(address)}</span>}
      </div>
    </div>
  );
}
