import { TargetEntity } from '@/server/api/trpc-routers/app-router/target-search';
import { Button } from '@/app/components/ui/button';
import { textStyles } from '@/app/styles/template-strings';
import { UsersIcon } from '@/app/components/icons/UsersIcon';
import { ExternalImage } from '../external-image';

type TargetSearchRowProps = {
  account: TargetEntity;
};

export const TargetSearchRow: React.FC<TargetSearchRowProps> = ({
  account
}) => {
  const hasFollowersInfo = Object.hasOwn(account, 'followerCount');

  return (
    <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 p-2">
      <ExternalImage
        src={account.image}
        fallbackSrc={'/user.png'}
        alt={`${account.label}'s profile picture`}
        className="w-10 h-10 rounded-full border-1 border-sage-900 select-none"
      />
      <div>
        <p className={textStyles['compact-emphasis']}>{account.label}</p>
        <div className="flex flex-row items-center gap-1">
          {hasFollowersInfo && (
            <>
              <UsersIcon className="size-3" />
              <span className={textStyles.label}>
                {account.followerCount} •
              </span>
            </>
          )}
          <span className={textStyles.label}>{account.sublabel}</span>
        </div>
      </div>
      <Button>Track</Button>
    </div>
  );
};
