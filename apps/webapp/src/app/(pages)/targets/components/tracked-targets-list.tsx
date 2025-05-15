'use client';

import { HelpIcon } from '@/app/components/icons/HelpIcon';
import { LocateIcon } from '@/app/components/icons/LocateIcon';
import {
  TargetSearchRow,
  TargetSearchRowSkeleton
} from '@/app/components/target-search/target-search-row';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/app/components/ui/popover';
import { Skeleton } from '@/app/components/ui/skeleton';
import { textStyles } from '@/app/styles/template-strings';
import { UITarget } from '@/app/utils/target/types';
import useBannerStore from '@/app/zustand/banners';
import { useShallow } from 'zustand/react/shallow';

type TrackedTargetsListProps = {
  isPendingAuthedAccountTargets: boolean;
  trackedTargets: UITarget[];
};

export const TrackedTargetsList = ({
  isPendingAuthedAccountTargets,
  trackedTargets
}: TrackedTargetsListProps) => {
  const lowBalanceBannerPresent = useBannerStore(
    useShallow((state) => state.lowBalanceBannerPresent)
  );

  if (isPendingAuthedAccountTargets) {
    return (
      <div>
        <div className="grid grid-cols-2 gap-2 mb-2 px-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12 justify-self-end" />
        </div>
        <div
          className={`overflow-y-auto pb-4 ${
            lowBalanceBannerPresent
              ? 'max-h-[calc(100dvh-431px)]'
              : 'max-h-[calc(100dvh-391px)]'
          }`}
        >
          <TargetSearchRowSkeleton />
          <TargetSearchRowSkeleton />
          <TargetSearchRowSkeleton />
        </div>
      </div>
    );
  }

  if (trackedTargets.length === 0) {
    return (
      <div className="border-dotted border-1 rounded-md flex flex-col gap-6 p-6 items-center">
        <div className="flex items-center justify-center p-2 rounded-md border border-border">
          <LocateIcon />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className={`${textStyles['title3']} text-center`}>
            You&apos;re not tracking anyone
          </p>
          <p className={`${textStyles['compact']} text-center`}>
            Start tracking profiles for token launches to auto-buy
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 mb-2 px-2">
        <div className={`${textStyles.label}`}>
          {trackedTargets.length} Targets
        </div>
        <div
          className={`${textStyles.label} justify-self-end flex items-center gap-2`}
        >
          <span>Max Spend</span>
          <Popover>
            <PopoverTrigger>
              <HelpIcon className="w-4 h-4" />
            </PopoverTrigger>
            <PopoverContent>
              <div className={textStyles.label}>
                This is the amount that’ll be spent on automated token
                purchases. If your balance falls below this amount, your
                remaining balance will be used instead.
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div
        className={`overflow-y-auto pb-4 ${
          lowBalanceBannerPresent
            ? 'max-h-[calc(100dvh-431px)]'
            : 'max-h-[calc(100dvh-391px)]'
        }`}
      >
        {trackedTargets.map((target) => (
          <TargetSearchRow
            key={`${target.fid}-${target.address}-${target.label}`}
            target={target}
            trackingStatus={target.trackingStatus}
          />
        ))}
      </div>
    </>
  );
};
