'use client';

import { type ReactNode, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { textStyles } from '@/app/styles/template-strings';
import { TargetSearchRow, TargetSearchRowSkeleton } from './target-search-row';
import {
  DrawerContent,
  DrawerTrigger,
  Drawer,
  DrawerClose
} from '../ui/drawer';
import { Button } from '../ui/button';
import { SearchInput } from '../ui/search-input';
import { searchToUiTarget } from '@/app/utils/target/format-target';
import { DrawerTitle } from '../ui/drawer';
import { isAuthedAccountTrackingTarget } from '@/app/utils/target/is-authed-account-tracking-target';

interface TargetSearchDrawerProps {
  trigger: ReactNode;
}

export default function TargetSearchDrawer({
  trigger
}: TargetSearchDrawerProps) {
  const trpc = useTRPC();
  const [searchString, setSearchString] = useState('');
  const showPopularTargets = searchString.length === 0;

  const debouncedSearchString = useDebounce(searchString, 400);

  const {
    data: authedAccountTargets,
    isPending: isPendingAuthedAccountTargets
  } = useQuery(trpc.wireTapAccount.getAuthedAccountTargets.queryOptions());

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

  const hasMorePages = data?.pages.at(-1)?.nextCursor !== undefined;

  const resultsTitle = (() => {
    if (showPopularTargets) return 'Popular Targets';
    if (isPending) return 'Loading...';
    if (isError) return 'Error';
    const totalResults = data?.pages.flatMap((page) => page.results);
    const totalResultsCount = totalResults?.length ?? 0;
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
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                placeholder="Farcaster username, wallet address, or ENS name"
                onClear={() => setSearchString('')}
              />
            </div>
            <DrawerClose asChild>
              <Button variant="ghost">Done</Button>
            </DrawerClose>
          </div>
          <DrawerTitle
            className={`${textStyles['compact-emphasis']} mt-4 text-left`}
          >
            {resultsTitle}
          </DrawerTitle>
          <div className="mt-2 h-[calc(85dvh-68px)] pb-8 overflow-y-auto">
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
                    isLoadingTrackedStatus={isPendingAuthedAccountTargets}
                  />
                ))}
            {hasMorePages && (
              <div className="mt-4 flex justify-center">
                <Button disabled={isPending} onClick={() => fetchNextPage()}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
