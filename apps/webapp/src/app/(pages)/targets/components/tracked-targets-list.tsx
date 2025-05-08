'use client';

import { HelpIcon } from '@/app/components/icons/HelpIcon';
import { LocateIcon } from '@/app/components/icons/LocateIcon';
import {
  TargetSearchRow,
  TargetSearchRowSkeleton
} from '@/app/components/target-search/target-search-row';
import { Skeleton } from '@/app/components/ui/skeleton';
import { textStyles } from '@/app/styles/template-strings';
import { UITarget } from '@/app/utils/target/types';

type TrackedTargetsListProps = {
  isPendingAuthedAccountTargets: boolean;
  trackedTargets: UITarget[];
};

export const TrackedTargetsList = ({
  isPendingAuthedAccountTargets,
  trackedTargets
}: TrackedTargetsListProps) => {
  if (isPendingAuthedAccountTargets) {
    return (
      <div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12 justify-self-end" />
        </div>
        <div className="max-h-[65dvh] overflow-y-auto py-2">
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
          <p className={`${textStyles['title3']}`}>
            You&apos;re not tracking anyone
          </p>
          <p className={`${textStyles['compact']}`}>
            Start tracking profiles for token launches to auto-buy
          </p>
        </div>
      </div>
    );
  }

  // TODO: Tooltip for max spend
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className={`${textStyles.label}`}>
          {trackedTargets.length} Targets
        </div>
        <div
          className={`${textStyles.label} justify-self-end flex items-center gap-2`}
        >
          <span>Max Spend</span>
          <HelpIcon className="w-4 h-4" />
        </div>
      </div>
      <div>
        {trackedTargets.map((target) => (
          <TargetSearchRow
            key={target.address}
            target={target}
            isLoadingTrackedStatus={false}
            isTracked={true}
          />
        ))}
      </div>
    </div>
  );
};
