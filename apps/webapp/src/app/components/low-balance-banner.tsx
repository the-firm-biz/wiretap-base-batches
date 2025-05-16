'use client';

import { useQuery } from '@tanstack/react-query';
import { MIN_TRADE_THRESHOLD_WEI } from '@wiretap/config';
import { useTRPC } from '../trpc-clients/trpc-react-client';
import { DepositDrawer } from './deposit-drawer/deposit-drawer';
import { TriangleAlertIcon } from './icons/TriangleAlertIcon';
import { Button } from '@/app/components/ui/button';
import { useBalance } from 'wagmi';
import useBannerStore from '../zustand/banners';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const LowBalanceBanner = () => {
  const trpc = useTRPC();
  const setZustandBannerValue = useBannerStore(
    useShallow((state) => state.setStoreValue)
  );

  const { data: gliderPortfolio, isLoading: isLoadingPortfolio } = useQuery(
    trpc.wireTapAccount.getAuthedAccountGliderPortfolio.queryOptions()
  );
  const { data: portfolioBalance, isLoading: isLoadingPortfolioBalance } =
    useBalance({
      address: gliderPortfolio?.address,
      query: {
        enabled: !!gliderPortfolio?.address
      }
    });

  const {
    data: authedAccountTargets,
    isLoading: isLoadingAuthedAccountTargets
  } = useQuery(trpc.wireTapAccount.getAuthedAccountTargets.queryOptions());

  const minRequiredTotalWei =
    authedAccountTargets?.reduce(
      (acc, target) => acc + target.tracker.maxSpend,
      BigInt(0)
    ) ?? BigInt(0);

  const portfolioBalanceWei = portfolioBalance?.value ?? BigInt(0);

  const isBelowMinRebalanceLimit =
    portfolioBalanceWei < MIN_TRADE_THRESHOLD_WEI;
  const isLowBalance = portfolioBalanceWei < minRequiredTotalWei;

  const showBanner = isLowBalance || isBelowMinRebalanceLimit;

  useEffect(() => {
    setZustandBannerValue('lowBalanceBannerPresent', showBanner);
  }, [showBanner, setZustandBannerValue]);

  if (
    isLoadingPortfolio ||
    isLoadingPortfolioBalance ||
    isLoadingAuthedAccountTargets
  ) {
    return null;
  }

  if (!showBanner) {
    return null;
  }

  return (
    <div className="animate-in slide-in-from-top h-10 border-b border-border bg-[url(/patterns/warning-pattern.png)] [image-rendering:pixelated] overflow-hidden">
      <div className="max-w-[80dvw] md:max-w-screen-md mx-auto py-[10px] text-center bg-background">
        <DepositDrawer
          trigger={
            <Button variant="link" className="h-5 py-0">
              <TriangleAlertIcon className="size-4" />
              Balance Low: Deposit Now
            </Button>
          }
        />
      </div>
    </div>
  );
};
