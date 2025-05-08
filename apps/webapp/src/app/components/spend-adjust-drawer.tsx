import { type ReactNode, useState } from 'react';
import { ExternalImage } from './external-image';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { textStyles } from '../styles/template-strings';
import { TrashIcon } from './icons/TrashIcon';
import { TargetCrosshair } from './icons/TargetCrosshair';
import { UITarget } from '../utils/target/types';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { trpcClientUtils, useTRPC } from '@/app/trpc-clients/trpc-react-client';

interface SpendAdjustDrawerProps {
  target: UITarget;
  trigger: ReactNode;
}

export const SpendAdjustDrawer = ({
  target,
  trigger
}: SpendAdjustDrawerProps) => {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();

  const { mutate: untrackTarget } = useMutation(
    trpc.wireTapAccount.untrackTargetForAuthedAccount.mutationOptions({
      onSuccess: () => {
        setOpen(false);
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
  const onTrashClick = () => {
    untrackTarget({
      evmAddress: target.address,
      neynarUser: target.searchTarget.neynarUser
    });
  };
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="px-4">
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
                onClick={onTrashClick}
              >
                <TrashIcon className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <DrawerTitle>
              <div className={textStyles['compact-mid']}>
                Spend how much per token buy?
              </div>
            </DrawerTitle>
            <div className={textStyles.compact}>Balance: 0.1</div>
          </div>
          <div className="py-2">
            <Input inputMode="numeric" />
          </div>
          <div className={textStyles.compact}>$50.03</div>
          <div className="grid grid-cols-4 gap-1 pt-[10px]">
            <Button variant="outline">0.01</Button>
            <Button variant="outline">0.05</Button>
            <Button variant="outline">0.1</Button>
            <Button variant="outline">0.2</Button>
          </div>
          <div className={`${textStyles.label} py-6`}>
            This is the amount that’ll be spent on automated token purchases. If
            your balance falls below this amount, your remaining balance will be
            used instead.
          </div>
          <div className="flex flex-col pb-4">
            <Button>Confirm Quantity</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
