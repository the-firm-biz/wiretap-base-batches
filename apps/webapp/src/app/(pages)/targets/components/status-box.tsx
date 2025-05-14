'use client';

import { useQuery } from '@tanstack/react-query';
import { textStyles } from '@/app/styles/template-strings';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import ReelToReelAnimation from './animated-reel-to-reel';
import AnimatedEllipsisText from '@/app/components/animated-ellipsis-text';

const Indicator: React.FC<{ color: 'red' | 'green'; isLoading: boolean }> = ({
  color,
  isLoading
}) => {
  if (isLoading) {
    return <div className="w-2 h-2 rounded-full bg-gray-700"></div>;
  }
  if (color === 'red') {
    return <div className="w-2 h-2 rounded-full bg-negative"></div>;
  }
  return <div className="w-2 h-2 rounded-full bg-positive"></div>;
};

export const StatusBox = () => {
  const trpc = useTRPC();

  const { data: authedAccountTargets, isPending } = useQuery(
    trpc.wireTapAccount.getAuthedAccountTargets.queryOptions()
  );

  const isActive = !!authedAccountTargets && authedAccountTargets.length > 0;

  const label = (() => {
    if (isPending) {
      return <AnimatedEllipsisText>Loading</AnimatedEllipsisText>;
    }
    if (isActive) {
      return 'Active';
    }
    return 'No Targets';
  })();

  return (
    <div className="flex justify-center items-center h-32">
      <div className="border border-border grid grid-cols-[2fr_1fr] max-w-[370px] w-full">
        <div
          className={`border-r-1 border-border p-4 flex items-center justify-center ${isPending ? 'opacity-65' : ''}`}
        >
          <ReelToReelAnimation isActive={isActive} />
        </div>
        <div className="p-2 text-right flex flex-col gap-2 justify-between">
          <div className="flex items-center justify-end gap-1">
            <div className={`${textStyles['compact-emphasis']}`}>{label}</div>
            <Indicator
              color={isActive ? 'green' : 'red'}
              isLoading={isPending}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className={textStyles.label}>Funding Balance</div>
            <div className={textStyles['compact-emphasis']}>0 ETH</div>
          </div>
        </div>
      </div>
    </div>
  );
};
