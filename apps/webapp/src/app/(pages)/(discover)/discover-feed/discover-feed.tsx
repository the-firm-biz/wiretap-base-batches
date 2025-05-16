'use client';

import { DiscoverFeedRow } from './discover-feed-row';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { Button } from '@/app/components/ui/button';
import AnimatedEllipsisText from '@/app/components/animated-ellipsis-text';
import useBannerStore from '@/app/zustand/banners';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/app/utils';
import { TargetSearchRowSkeleton } from '@/app/components/target-search/target-search-row';

export function DiscoverFeed() {
  const trpc = useTRPC();
  const isShowingLowBalanceBanner = useBannerStore(
    useShallow((state) => state.lowBalanceBannerPresent)
  );
  const getMaxHeight = () => {
    // Header height 64
    // After heading element padding 16
    // Search button 40
    // Padding immediately after search button 16
    // Heading padding 16
    // Heading 20
    // Footer height 69
    // Without low balance banner total = 241px

    // LowBalanceBanner height 40
    // With low balance banner total = 281px
    if (isShowingLowBalanceBanner) {
      return `max-h-[calc(100dvh-281px)]`;
    }

    return `max-h-[calc(100dvh-241px)]`;
  };

  const { isPending, fetchNextPage, hasNextPage, data } = useInfiniteQuery(
    trpc.app.getTokensForDiscoverFeed.infiniteQueryOptions(undefined, {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    })
  );

  const {
    data: authedAccountTargets,
    isPending: isPendingAuthedAccountTargets
  } = useQuery(trpc.wireTapAccount.getAuthedAccountTargets.queryOptions());

  return (
    <div
      className={cn(
        getMaxHeight(),
        'flex flex-col pt-2 pb-4 gap-2 overflow-y-auto'
      )}
    >
      {isPending && (
        <div className="flex flex-col gap-2">
          {/* @todo Discover For now reusing search skeletons as they are very similar, check out if we wanna custom ones here */}
          <TargetSearchRowSkeleton />
          <TargetSearchRowSkeleton />
          <TargetSearchRowSkeleton />
        </div>
      )}
      {data?.pages
        .flatMap((page) => page.tokens)
        .map((token) => (
          <DiscoverFeedRow
            key={token.tokenId}
            token={token}
            trackingStatus={{
              isTracking: authedAccountTargets
                ? authedAccountTargets.some(
                    (target) =>
                      target.tracker.trackedAccountEntityId ===
                      token.accountEntityId
                  )
                : false,
              isLoading: isPendingAuthedAccountTargets,
              maxSpend:
                authedAccountTargets?.find(
                  (target) =>
                    target.tracker.trackedAccountEntityId ===
                    token.accountEntityId
                )?.tracker.maxSpend ?? BigInt(0),
              targetAccountEntityId: token.accountEntityId
            }}
          />
        ))}
      <div className="flex justify-center">
        {hasNextPage && (
          <Button onClick={() => fetchNextPage()} disabled={isPending}>
            {isPending ? (
              <AnimatedEllipsisText>Loading more</AnimatedEllipsisText>
            ) : (
              'Load more'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
