import { type ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { trpcClientUtils, useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { ExternalImage } from '../external-image';
import { textStyles } from '../../styles/template-strings';
import { TrashIcon } from '../icons/TrashIcon';
import { TargetCrosshair } from '../icons/TargetCrosshair';
import { TargetTrackingStatus, UITarget } from '../../utils/target/types';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger
} from '../ui/drawer';
import { SpendAdjustForm } from './spend-adjust-form';

interface SpendAdjustDrawerProps {
  target: UITarget;
  trigger: ReactNode;
  trackingStatus: TargetTrackingStatus;
  isControlledOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SpendAdjustDrawer = ({
  target,
  trigger,
  trackingStatus,
  isControlledOpen,
  onOpenChange
}: SpendAdjustDrawerProps) => {
  const trpc = useTRPC();
  const [open, setOpen] = useState(isControlledOpen);
  const [isUntracking, setIsUntracking] = useState(false);

  useEffect(() => {
    setOpen(isControlledOpen);
  }, [isControlledOpen]);

  const { mutate: untrackTarget } = useMutation(
    trpc.wireTapAccount.untrackTargetForAuthedAccount.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        setIsUntracking(false);
        onOpenChange(false);
        trpcClientUtils.wireTapAccount.getAuthedAccountTargets.invalidate();
        toast(
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className={textStyles['compact-emphasis']}>
                Target Removed
              </div>
              <div className={textStyles.label}>
                Agents dispatched to remove bugging equipment
              </div>
            </div>
          </div>
        );
      },
      onError: () => {
        setIsUntracking(false);
        toast(
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className={textStyles['compact-emphasis']}>
                Failed to remove target
              </div>
              <div className={textStyles.label}>Please try again</div>
            </div>
          </div>
        );
      }
    })
  );

  const stopTrackingTarget = () => {
    // The targetAccountEntityId is guaranteed to be present within spend adjust drawer
    setIsUntracking(true);
    untrackTarget({
      targetAccountEntityId: trackingStatus.targetAccountEntityId!
    });
  };

  const onDrawerOpenChange = (openState: boolean) => {
    setOpen(openState);
    onOpenChange(openState);
  };

  return (
    <Drawer open={open} onOpenChange={onDrawerOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        {/* Visually hidden title & description */}
        <DrawerTitle className="sr-only">
          Adjust Max Spend for target {target.label}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Specify the amount that you would like to spend on purchase of tokens
          for this target
        </DrawerDescription>
        {/* End visually hidden title & description */}
        <div className="grid grid-cols-[40px_1fr_40px] h-10 items-center gap-3 mb-10">
          <div className="relative flex items-center justify-center">
            <TargetCrosshair className="absolute w-10 h-10" />
            <ExternalImage
              src={target.image}
              fallbackSrc={'/user.png'}
              alt={`${target.label}'s profile picture`}
              className="absolute w-6 h-6 rounded-full border-1 border-border select-none"
            />
          </div>
          <div className={textStyles.title4}>{target.label}</div>
          <div className="flex items-center justify-center">
            <button
              className="w-10 h-10 flex items-center justify-center cursor-pointer"
              onClick={stopTrackingTarget}
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        </div>
        <SpendAdjustForm
          isDisabledForm={isUntracking}
          trackingStatus={trackingStatus}
        />
      </DrawerContent>
    </Drawer>
  );
};
