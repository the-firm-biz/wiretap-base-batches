'use client';

import { DiscoverFeedRow } from './discover-feed-row';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { Button } from '@/app/components/ui/button';
import AnimatedEllipsisText from '@/app/components/animated-ellipsis-text';

export function DiscoverFeed() {
  const trpc = useTRPC();

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
    <div className="flex flex-col py-2 gap-2">
      {/* @todo Discover - loading skeles */}
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
