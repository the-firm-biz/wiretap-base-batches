'use client';

import { DiscoverFeedRow } from './discover-feed-row';
import { useInfiniteQuery } from '@tanstack/react-query';
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

  return (
    <div className="flex flex-col py-2 gap-2">
      {/* @todo Discover - loading skeles */}
      {data?.pages
        .flatMap((page) => page.tokens)
        .map((token) => <DiscoverFeedRow key={token.tokenId} token={token} />)}
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
