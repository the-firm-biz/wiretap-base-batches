import { Button } from '@/app/components/ui/button';
import { textStyles } from '@/app/styles/template-strings';
import { UsersIcon } from '@/app/components/icons/UsersIcon';
import { ExternalImage } from '../external-image';
import { isAddress } from 'viem';
import { formatAddress } from '@/app/utils/format/format-address';
import { Target } from '@/app/utils/target/types';
import { Skeleton } from '../ui/skeleton';

type TargetSearchRowProps = {
  target: Target;
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

export const TargetSearchRow: React.FC<TargetSearchRowProps> = ({ target }) => {
  const hasFollowersInfo = Object.hasOwn(target, 'followerCount');

  const label = isAddress(target.label)
    ? formatAddress(target.label)
    : target.label;

  const sublabel =
    target.sublabel && isAddress(target.sublabel)
      ? formatAddress(target.sublabel)
      : target.sublabel;

  return (
    <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 p-2">
      <ExternalImage
        src={target.image}
        fallbackSrc={'/user.png'}
        alt={`${target.label}'s profile picture`}
        className="w-10 h-10 rounded-full border-1 border-sage-900 select-none"
      />
      <div>
        <p className={textStyles['compact-emphasis']}>{label}</p>
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
          <span className={textStyles.label}>{sublabel}</span>
        </div>
      </div>
      <Button>Track</Button>
    </div>
  );
};
