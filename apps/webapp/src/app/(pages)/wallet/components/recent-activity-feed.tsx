'use client';

import { textStyles } from '@/app/styles/template-strings';
import {
  GliderPortfolioActivity,
  GliderPortfolioSwapsAndActivities
} from '@/server/api/trpc-routers/glider-router/routes/get-glider-portfolio-analysis-data';
import { RecentActivityActivityItem } from './recent-activity-activity-item';
import useBannerStore from '@/app/zustand/banners';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/app/utils/cn';
interface RecentActivityProps {
  portfolioAnalysisData: GliderPortfolioSwapsAndActivities[];
}

export function RecentActivityFeed({
  portfolioAnalysisData
}: RecentActivityProps) {
  const isShowingLowBalanceBanner = useBannerStore(
    useShallow((state) => state.lowBalanceBannerPresent)
  );
  const getMaxHeight = () => {
    // Header height
    // 64 +
    // Wallet balance height
    // 196 +
    // Recent activity text + top padding height
    // 68 +
    // Footer height
    // 69
    // Without low balance banner total = 397px

    // LowBalanceBanner height
    // + 40
    // With low balance banner total = 437px
    if (isShowingLowBalanceBanner) {
      return `max-h-[calc(100dvh-437px)]`;
    }

    return `max-h-[calc(100dvh-397px)]`;
  };

  return (
    <div>
      <p className={`${textStyles['compact-emphasis']} pb-4`}>
        Recent Activity
      </p>
      <div
        className={cn(getMaxHeight(), 'overflow-y-auto', 'pb-4')}
        // style={{
        //   maxHeight: `calc(100dvh-700px)`
        // }}
      >
        {portfolioAnalysisData.map((activityItem) => {
          if (
            activityItem.type === 'deposit' ||
            activityItem.type === 'withdraw'
          ) {
            return (
              <RecentActivityActivityItem
                key={activityItem.id}
                activityItem={activityItem as GliderPortfolioActivity}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
