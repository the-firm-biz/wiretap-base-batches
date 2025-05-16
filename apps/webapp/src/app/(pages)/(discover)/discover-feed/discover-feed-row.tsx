import { formatDistanceToNowStrict } from 'date-fns';
import AnimatedEllipsisText from '@/app/components/animated-ellipsis-text';
import { ExternalImage } from '@/app/components/external-image';
import { SpendAdjustDrawer } from '@/app/components/spend-adjust-drawer/spend-adjust-drawer';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { textStyles } from '@/app/styles/template-strings';
import { trpcClientUtils, useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { formatAddress } from '@/app/utils/format/format-address';
import { formatUnits } from '@/app/utils/format/format-units';
import { TargetTrackingStatus } from '@/app/utils/target/types';
import { useMutation } from '@tanstack/react-query';
import { TokenWithCreatorMetadata } from '@wiretap/db';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ClankerLogoIcon } from '@/app/components/icons/ClankerLogoIcon';

export function DiscoverFeedRow({
  token,
  trackingStatus
}: {
  key: number;
  token: TokenWithCreatorMetadata;
  trackingStatus: TargetTrackingStatus;
}) {
  const {
    farcasterUsername,
    farcasterDisplayName,
    farcasterFollowerCount,
    farcasterPfpUrl,
    creatorAddress,
    tokenCreatedAt,
    tokenName,
    tokenSymbol,
    tokenImageUrl,
    poolAthMcapUsd,
    // poolStartingMcapUsd,
    creatorTokenIndex
    // deploymentContractAddress,
  } = token;

  const getDisplayName = () => {
    if (farcasterDisplayName) {
      return farcasterDisplayName;
    }

    // @todo Discover - resolve BaseName
    if (creatorAddress) {
      return formatAddress(creatorAddress);
    }

    // Realistically should never happen
    return 'Unknown';
  };

  const trpc = useTRPC();
  const [isConfirmingTrack, setIsConfirmingTrack] = useState(false);
  const [isOpenSpendAdjustDrawer, setIsOpenSpendAdjustDrawer] = useState(false);

  const { mutate: trackTarget } = useMutation(
    trpc.wireTapAccount.trackTargetForAuthedAccount.mutationOptions({
      onSuccess: () => {
        trpcClientUtils.wireTapAccount.getAuthedAccountTargets.invalidate();
        toast(
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className={textStyles['compact-emphasis']}>Now Tracking</div>
              <div className={textStyles.label}>
                {getDisplayName()} is closely monitored
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsOpenSpendAdjustDrawer(true)}
            >
              Adjust
            </Button>
          </div>
        );
      },
      onError: () => {
        setIsConfirmingTrack(false);
        toast(
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className={textStyles['compact-emphasis']}>
                Failed to track {getDisplayName()}
              </div>
              <div className={textStyles.label}>Please try again</div>
            </div>
          </div>
        );
      }
    })
  );

  useEffect(() => {
    if (isConfirmingTrack && trackingStatus.isTracking) {
      setIsConfirmingTrack(false);
    }
  }, [isConfirmingTrack, setIsConfirmingTrack, trackingStatus]);

  const onTrackClick = () => {
    setIsConfirmingTrack(true);
    trackTarget({
      targetAccountEntityId: trackingStatus.targetAccountEntityId
    });
  };

  const actionButton = () => {
    if (trackingStatus.isTracking) {
      const ethDisplayValue = formatUnits(trackingStatus.maxSpend, 18, 4);
      return (
        <SpendAdjustDrawer
          targetLabel={getDisplayName()}
          targetImage={farcasterPfpUrl ?? undefined}
          trigger={
            <Button size="sm" variant="outline">
              {ethDisplayValue} ETH
            </Button>
          }
          trackingStatus={trackingStatus}
          isControlledOpen={isOpenSpendAdjustDrawer}
          onOpenChange={setIsOpenSpendAdjustDrawer}
        />
      );
    }
    if (trackingStatus.isLoading) {
      return (
        <Button size="sm" disabled variant="default">
          <AnimatedEllipsisText></AnimatedEllipsisText>
        </Button>
      );
    }
    return (
      <Button size="sm" disabled={isConfirmingTrack} onClick={onTrackClick}>
        {isConfirmingTrack ? (
          <AnimatedEllipsisText>Track</AnimatedEllipsisText>
        ) : (
          'Track'
        )}
      </Button>
    );
  };

  return (
    <div className="flex gap-3 p-2 w-full">
      <ExternalImage
        src={farcasterPfpUrl ?? undefined}
        fallbackSrc="/user-dithered.png"
        alt={farcasterUsername ?? 'farcaster user profile picture'}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full border-1 border-border select-none object-cover"
      />
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex space-between items-center">
          <div className="flex gap-1 flex-col w-full">
            <div className={`${textStyles['compact-emphasis']}`}>
              {getDisplayName()}
            </div>
            <div className="flex gap-1">
              {farcasterFollowerCount !== null && (
                <div className={textStyles['label']}>
                  {Intl.NumberFormat('en', { notation: 'compact' }).format(
                    farcasterFollowerCount
                  )}{' '}
                  •
                </div>
              )}
              {farcasterUsername && (
                <div className={textStyles['label']}>@{farcasterUsername}</div>
              )}
            </div>
          </div>
          {actionButton()}
        </div>
        <div className="flex items-center gap-1">
          {creatorTokenIndex + 1 === 1 ? (
            <Badge
              className={`bg-yellow-100 text-yellow-600 ${textStyles['code-01']}`}
            >
              🎉 Launch #{creatorTokenIndex + 1}
            </Badge>
          ) : (
            <Badge
              className={`bg-blue-100 text-blue-600 ${textStyles['code-01']}`}
            >
              Launch #{creatorTokenIndex + 1}
            </Badge>
          )}
          <span className={textStyles['label']}>on </span>
          <ClankerLogoIcon className="size-4" />
          <span className={textStyles['label-mid']}>Clanker</span>
          <span className={textStyles['label']}>
            {formatDistanceToNowStrict(tokenCreatedAt, {
              addSuffix: true
            })}
          </span>
        </div>
        <div className="flex flex-col rounded-md border border-border gap-4 p-[12px]">
          <div className="grid grid-cols-[32px_1fr_88px] gap-2 w-full">
            <ExternalImage
              src={tokenImageUrl ?? undefined}
              fallbackSrc="/token-image-missing.svg"
              alt={tokenSymbol}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full select-none object-cover"
            />
            <div className="flex flex-col flex-1">
              <p className={textStyles['compact-emphasis']}>{tokenSymbol}</p>
              <p className={textStyles['label']}>{tokenName}</p>
            </div>
            <div className="flex gap-1">
              {/* @todo Discover - Base scan & dexscreener links */}
              <div className="flex gap-1"></div>
            </div>
          </div>
          {/* @todo Discover - WireTap Edge */}
          {/* Calculate the gap between poolStartingMcapUsd and poolAthMcapUsd */}
          <div className="flex border border-border w-fit px-8">
            WireTap Edge
          </div>

          <div className="flex flex-col">
            <p className={textStyles['label']}>Mcap</p>
            <p className={textStyles['label']}>
              $
              {poolAthMcapUsd?.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </p>
            {/* @todo Discover - MCap change percentage - we don't have data for prev 24hrs mcap so leave this */}
          </div>
        </div>
      </div>
    </div>
  );
}
