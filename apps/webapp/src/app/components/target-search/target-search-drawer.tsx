'use client';

import { type ReactNode, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { textStyles } from '@/app/styles/template-strings';
import { TargetSearchRow, TargetSearchRowSkeleton } from './target-search-row';
import { DrawerContent, DrawerTrigger, Drawer } from '../ui/drawer';
import { Button } from '../ui/button';
import { SearchInput } from '../ui/search-input';
import { searchToUiTarget } from '@/app/utils/target/format-target';
import { DrawerTitle } from '../ui/drawer';
import { isAuthedAccountTrackingTarget } from '@/app/utils/target/is-authed-account-tracking-target';
import { AuthedAccountTarget } from '@/server/api/trpc-routers/wiretap-account-router/routes/get-authed-account-targets';

interface TargetSearchDrawerProps {
  trigger: ReactNode;
  isLoadingAccountTargets: boolean;
  authedAccountTargets?: AuthedAccountTarget[];
}

export default function TargetSearchDrawer({
  trigger,
  authedAccountTargets,
  isLoadingAccountTargets
}: TargetSearchDrawerProps) {
  const trpc = useTRPC();
  const [searchString, setSearchString] = useState('');
  const showPopularTargets = searchString.length === 0;

  const debouncedSearchString = useDebounce(searchString, 400);

  const { data: popularTargets, isPending: isPendingPopularTargets } = useQuery(
    trpc.app.getPopularTargets.queryOptions()
  );

  const { isPending, fetchNextPage, data, isError } = useInfiniteQuery(
    trpc.app.targetSearch.infiniteQueryOptions(
      {
        searchString: debouncedSearchString
      },
      {
        enabled: debouncedSearchString.length >= 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor
      }
    )
  );

  const resultsTitle = (() => {
    if (showPopularTargets) return 'Popular Targets';
    if (isPending) return 'Loading...';
    if (isError) return 'Error';
    const totalResults = data?.pages.flatMap((page) => page.results);
    const totalResultsCount = totalResults?.length ?? 0;
    const hasMorePages = data?.pages[0].nextCursor !== undefined;
    return `${totalResultsCount}${hasMorePages ? '+' : ''} result${totalResultsCount === 1 ? '' : 's'}`;
  })();

  const searchResults = data?.pages
    .flatMap((page) => page.results)
    .map(searchToUiTarget);

  const isNothingToShow =
    isPendingPopularTargets || (!showPopularTargets && isPending);
  const skeletonLoader = Array.from({ length: 9 }).map((_, index) => (
    <TargetSearchRowSkeleton key={index} />
  ));

  const rowsToShow = (() => {
    if (showPopularTargets) {
      return popularTargets?.map(searchToUiTarget);
    }
    return searchResults;
  })();

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="h-[85dvh]">
          <SearchInput
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            placeholder="Farcaster username, wallet address, or ENS name"
            onClear={() => setSearchString('')}
          />
          <DrawerTitle
            className={`${textStyles['compact-emphasis']} mt-4 text-left`}
          >
            {resultsTitle}
          </DrawerTitle>
          <div className="mt-2 h-[60dvh] overflow-y-auto">
            {isNothingToShow
              ? skeletonLoader
              : rowsToShow?.map((row) => (
                  <TargetSearchRow
                    key={`${row.address}-${row.fid}`}
                    target={row}
                    isTracked={isAuthedAccountTrackingTarget(
                      row.searchTarget,
                      authedAccountTargets
                    )}
                    isLoadingTrackedStatus={isLoadingAccountTargets}
                  />
                ))}
          </div>
          {data?.pages[0].nextCursor && (
            <div className="mt-4 flex justify-center">
              <Button onClick={() => fetchNextPage()}>Load more</Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
