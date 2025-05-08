'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { textStyles } from '@/app/styles/template-strings';
import { TargetSearchRow } from './target-search-row';
import { Button } from '../ui/button';
import { SearchInput } from '../ui/search-input';

export default function TargetSearch() {
  const trpc = useTRPC();
  const [searchString, setSearchString] = useState('');

  const debouncedSearchString = useDebounce(searchString, 400);

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
    if (searchString.length === 0) return 'Popular Targets'; // TODO: Implement popular targets
    if (isPending) return 'Loading...';
    if (isError) return 'Error';
    const totalResults = data?.pages.flatMap((page) => page.results);
    const totalResultsCount = totalResults?.length ?? 0;
    const hasMorePages = data?.pages[0].nextCursor !== undefined;
    return `${totalResultsCount}${hasMorePages ? '+' : ''} result${totalResultsCount === 1 ? '' : 's'}`;
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
        {data?.pages
          .flatMap((page) => page.results)
          .map((row) => (
            <TargetSearchRow key={`${row.address}-${row.fid}`} account={row} />
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
