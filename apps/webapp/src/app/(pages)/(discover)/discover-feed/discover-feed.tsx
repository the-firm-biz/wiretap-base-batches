'use client';

import { DiscoverFeedRow } from './discover-feed-row';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';

export function DiscoverFeed() {
  const trpc = useTRPC();

  const { data: tokens } = useQuery(
    trpc.app.getTokensForDiscoverFeed.queryOptions()
  );

  return (
    <div>
      <DiscoverFeedRow />
    </div>
  );
}
