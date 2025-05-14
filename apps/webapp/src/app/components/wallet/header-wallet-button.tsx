'use client';

import { useAccount, useEnsAvatar, useEnsName } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import {
  useAvatar as useBaseNameAvatar,
  useName as useBaseName
} from '@coinbase/onchainkit/identity';
import Image from 'next/image';
import { Button } from '../ui/button';
import { base, mainnet } from 'viem/chains';
import { Skeleton } from '../ui/skeleton';
import { useIsMounted } from '@/app/hooks/use-is-mounted';

export function HeaderWalletButton() {
  const { open } = useAppKit();
  const { address, isConnecting } = useAccount();

  const { data: baseName, isLoading: isLoadingBaseName } = useBaseName(
    {
      address: address!,
      chain: base
    },
    { enabled: !!address }
  );
  const { data: baseAvatar, isLoading: isLoadingBaseAvatar } =
    useBaseNameAvatar(
      { ensName: baseName!, chain: base },
      { enabled: !!baseName }
    );

  const { data: ensName, isLoading: isLoadingEnsName } = useEnsName({
    address: address!,
    chainId: mainnet.id,
    query: {
      enabled: !!address
    }
  });
  const { data: ensAvatar, isLoading: isLoadingEnsAvatar } = useEnsAvatar({
    name: ensName!,
    chainId: mainnet.id,
    query: {
      enabled: !!ensName
    }
  });

  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  const avatarComponent = (() => {
    const isLoadingNamesAvatars =
      isLoadingBaseName ||
      isLoadingEnsName ||
      isLoadingBaseAvatar ||
      isLoadingEnsAvatar;

    if (isLoadingNamesAvatars || isConnecting) {
      return (
        <Skeleton className="rounded-full bg-background border border-border w-[32px] h-[32px]" />
      );
    }

    // Condition shouldn't be met - component won't be rendered for disconnected users
    if (!address) {
      return null;
    }

    const avatarSrc = baseAvatar ?? ensAvatar;

    if (!avatarSrc) {
      return (
        <div className="rounded-full bg-background border border-border w-[32px] h-[32px] overflow-hidden">
          <Image
            src="/user-dithered.png"
            alt={baseName || ensName || address}
            width={32}
            height={32}
            priority
          />
        </div>
      );
    }

    return (
      <div className="rounded-full bg-background border border-border overflow-hidden">
        <Image
          src={avatarSrc}
          alt={baseName || ensName || address}
          width={32}
          height={32}
          priority
        />
      </div>
    );
  })();

  return (
    <div className="flex items-center gap-2">
      <Button size="icon" onClick={() => open()}>
        {avatarComponent}
      </Button>
    </div>
  );
}
