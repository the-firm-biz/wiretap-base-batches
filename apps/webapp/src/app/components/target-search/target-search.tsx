'use client';

import { useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { textStyles } from '@/app/styles/template-strings';
import { TargetSearchRow, TargetSearchRowSkeleton } from './target-search-row';
import { Button } from '../ui/button';
import { SearchInput } from '../ui/search-input';
import { formatTarget } from '@/app/utils/target/formatTarget';

export default function TargetSearch() {
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
    .map(formatTarget);

  const isNothingToShow =
    isPendingPopularTargets || (!showPopularTargets && isPending);
  const skeletonLoader = Array.from({ length: 9 }).map((_, index) => (
    <TargetSearchRowSkeleton key={index} />
  ));

  const rowsToShow = (() => {
    if (showPopularTargets) {
      return popularTargets?.map(formatTarget);
    }
    return searchResults;
  })();

  return (
    <div>
      <SearchInput
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        placeholder="Farcaster username, wallet address, or ENS name"
        onClear={() => setSearchString('')}
      />
      <div className={`${textStyles['compact-emphasis']} mt-4`}>
        {resultsTitle}
      </div>
      <div className="mt-2">
        {isNothingToShow
          ? skeletonLoader
          : rowsToShow?.map((row) => (
              <TargetSearchRow key={`${row.address}-${row.fid}`} target={row} />
            ))}
      </div>
      {data?.pages[0].nextCursor && (
        <div className="mt-4 flex justify-center">
          <Button onClick={() => fetchNextPage()}>Load more</Button>
        </div>
      )}
    </div>
  );
}
