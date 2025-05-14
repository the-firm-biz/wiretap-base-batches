'use client';

import { EthIcon } from '@/app/components/icons/EthIcon';
import { Skeleton } from '@/app/components/ui/skeleton';
import { textStyles } from '@/app/styles/template-strings';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { formatUnits } from '@/app/utils/format/format-units';
import { formatUsd } from '@/app/utils/format/format-usd';
import { useQuery } from '@tanstack/react-query';
import { useBalance } from 'wagmi';

export function GliderPortfolioBalance() {
  const trpc = useTRPC();

  const { data: gliderPortfolio, isLoading: isLoadingPortfolio } = useQuery(
    trpc.wireTapAccount.getAuthedAccountGliderPortfolio.queryOptions()
  );
  const { data: portfolioBalance } = useBalance({
    address: gliderPortfolio?.address,
    query: {
      enabled: !!gliderPortfolio?.address
    }
  });

  const { data: tokenPrice, isLoading: isLoadingTokenPrice } = useQuery(
    trpc.app.getEthPriceUsd.queryOptions()
  );

  const isLoadingQueries = isLoadingPortfolio || isLoadingTokenPrice;

  const ethDisplayValue = formatUnits(
    portfolioBalance?.value || BigInt(0),
    18,
    5
  );
  const usdDisplayValue = formatUsd(ethDisplayValue * (tokenPrice || 0));

  return (
    <div className="flex flex-col gap-2 text-accent-foreground">
      <p className={`${textStyles.compact}`}>Your WireTap Balance</p>
      <div className="flex flex-row items-center gap-2">
        <EthIcon className="size-8" />
        {isLoadingQueries ? (
          <Skeleton className="h-[40px] w-[124px] bg-background/20" />
        ) : (
          <p className={`${textStyles.title1}`}>{ethDisplayValue} ETH</p>
        )}
      </div>
      {isLoadingQueries ? (
        <Skeleton className="h-[16px] w-[64px] bg-background/20" />
      ) : (
        <p className={`${textStyles['code-01']}`}>${usdDisplayValue} USD</p>
      )}
    </div>
  );
}
