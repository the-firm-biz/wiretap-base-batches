import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { textStyles } from '@/app/styles/template-strings';
import { UsersIcon } from '@/app/components/icons/UsersIcon';
import { ExternalImage } from '../external-image';
import { TargetTrackingStatus, UITarget } from '@/app/utils/target/types';
import { Skeleton } from '../ui/skeleton';
import { SpendAdjustDrawer } from '../spend-adjust-drawer/spend-adjust-drawer';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { trpcClientUtils, useTRPC } from '@/app/trpc-clients/trpc-react-client';
import AnimatedEllipsisText from '../animated-ellipsis-text';
import { formatUnits } from '@/app/utils/format/format-units';

type TargetSearchRowProps = {
  target: UITarget;
  trackingStatus: TargetTrackingStatus;
};

export const TargetSearchRowSkeleton = () => {
  return (
    <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 p-2">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="w-36 h-4 rounded-md" />
        <Skeleton className="w-28 h-3 rounded-md" />
      </div>
      <Skeleton className="w-19 h-10" />
    </div>
  );
};

export const TargetSearchRow: React.FC<TargetSearchRowProps> = ({
  target,
  trackingStatus
}) => {
  const trpc = useTRPC();
  const [isConfirmingTrack, setIsConfirmingTrack] = useState(false);
  const [isOpenSpendAdjustDrawer, setIsOpenSpendAdjustDrawer] = useState(false);

  const hasFollowersInfo =
    Object.hasOwn(target, 'followerCount') &&
    Number.isInteger(target.followerCount);

  const { mutate: trackTarget } = useMutation(
    trpc.wireTapAccount.trackTargetForAuthedAccount.mutationOptions({
      onSuccess: () => {
        trpcClientUtils.wireTapAccount.getAuthedAccountTargets.invalidate();
        toast(
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className={textStyles['compact-emphasis']}>Now Tracking</div>
              <div className={textStyles.label}>
                {target.label} is closely monitored
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
                Failed to track {target.label}
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
      targetEvmAddress: target.address,
      targetNeynarUser: target.searchTarget.neynarUser
    });
  };

  const actionButton = () => {
    if (trackingStatus.isTracking) {
      const ethDisplayValue = formatUnits(trackingStatus.maxSpend, 18, 4);
      return (
        <SpendAdjustDrawer
          target={target}
          trigger={<Button variant="outline">{ethDisplayValue} ETH</Button>}
          trackingStatus={trackingStatus}
          isControlledOpen={isOpenSpendAdjustDrawer}
          onOpenChange={setIsOpenSpendAdjustDrawer}
        />
      );
    }
    if (trackingStatus.isLoading) {
      return (
        <Button disabled variant="default">
          <AnimatedEllipsisText></AnimatedEllipsisText>
        </Button>
      );
    }
    return (
      <Button disabled={isConfirmingTrack} onClick={onTrackClick}>
        {isConfirmingTrack ? (
          <AnimatedEllipsisText>Track</AnimatedEllipsisText>
        ) : (
          'Track'
        )}
      </Button>
    );
  };

  return (
    <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 p-2">
      <ExternalImage
        src={target.image}
        fallbackSrc={'/user.png'}
        alt={`${target.label}'s profile picture`}
        className="w-10 h-10 rounded-full border-1 border-border select-none"
      />
      <div>
        <p className={textStyles['compact-emphasis']}>{target.label}</p>
        <div className="flex flex-row items-center gap-1">
          {hasFollowersInfo && (
            <>
              <UsersIcon className="size-3" />
              <span className={textStyles.label}>
                {Intl.NumberFormat('en', { notation: 'compact' }).format(
                  target.followerCount!
                )}{' '}
                •
              </span>
            </>
          )}
          <span className={textStyles.label}>{target.sublabel}</span>
        </div>
      </div>
      {actionButton()}
    </div>
  );
};
