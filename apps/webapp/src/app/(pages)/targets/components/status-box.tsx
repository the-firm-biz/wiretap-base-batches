import { textStyles } from '@/app/styles/template-strings';
import ReelToReelAnimation from './animated-reel-to-reel';

const Indicator: React.FC<{ color: 'red' | 'green' }> = ({ color }) => {
  if (color === 'red') {
    return <div className="w-2 h-2 rounded-full bg-negative"></div>;
  }
  return <div className="w-2 h-2 rounded-full bg-positive"></div>;
};

export const StatusBox = () => {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="border border-border grid grid-cols-[2fr_1fr] max-w-[370px] w-full">
        <div className="border-r-1 border-border p-4 flex items-center justify-center">
          <ReelToReelAnimation />
        </div>
        <div className="p-2 text-right flex flex-col gap-2 justify-between">
          <div
            className={`${textStyles['compact-emphasis']} flex items-center justify-end gap-1`}
          >
            <div>No Targets</div>
            <Indicator color="red" />
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
