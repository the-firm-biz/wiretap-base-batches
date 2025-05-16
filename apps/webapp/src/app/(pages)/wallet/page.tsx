// @todo jeffrey - remove once not debug UI
'use client';

import { useTRPC } from '@/app/trpc-clients/trpc-react-client';

import { GliderPortfolioBalance } from './components/glider-portfolio-balance';
import { Button } from '@/app/components/ui/button';
import { DownloadIcon } from '@/app/components/icons/DownloadIcon';
import { UploadIcon } from '@/app/components/icons/UploadIcon';
import { DepositDrawer } from '@/app/components/deposit-drawer/deposit-drawer';
import { useQuery } from '@tanstack/react-query';
import { WalletNotice } from './components/wallet-notice';
import { useAccount, useBalance } from 'wagmi';
import { WithdrawDrawer } from '@/app/components/withdraw-drawer/withdraw-drawer';
import { RecentActivityFeed } from './components/recent-activity-feed';

export default function WalletPage() {
  const trpc = useTRPC();

  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery(
    trpc.wireTapAccount.getAuthedAccountGliderPortfolio.queryOptions()
  );
  const { data: portfolioBalance } = useBalance({
    address: portfolio?.address,
    query: {
      enabled: !!portfolio?.address,
      refetchInterval: 10000
    }
  });
  const portfolioHasZeroBalance =
    !portfolioBalance?.value || portfolioBalance.value === BigInt(0);

  const { address } = useAccount();
  const { data: eoaBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address,
      refetchInterval: 10000
    }
  });
  const userHasZeroBalance =
    !eoaBalance?.value || eoaBalance.value === BigInt(0);

  const { data: portfolioAnalysisData, isLoading: isLoadingPortfolioAnalysis } =
    useQuery(
      trpc.glider.getGliderPortfolioAnalysisData.queryOptions(
        {
          portfolioId: portfolio?.portfolioId as string
        },
        {
          enabled: !!portfolio?.portfolioId
        }
      )
    );

  return (
    <div>
      <div className="bg-accent p-4">
        <div className="flex flex-col gap-4 max-w-screen-md w-full mx-auto py-2">
          <GliderPortfolioBalance />
          <div className="flex gap-2">
            <DepositDrawer
              trigger={
                <Button
                  disabled={isLoadingPortfolio || userHasZeroBalance}
                  variant="outline"
                >
                  <DownloadIcon className="size-4" /> Deposit
                </Button>
              }
            />
            <WithdrawDrawer
              trigger={
                <Button
                  disabled={
                    isLoadingPortfolio || !portfolio || portfolioHasZeroBalance
                  }
                  variant="outline"
                >
                  <UploadIcon className="size-4" /> Withdraw
                </Button>
              }
            />
          </div>
        </div>
      </div>
      <div className="px-4">
        <div className="max-w-screen-md w-full mx-auto pt-[32px]">
          {!portfolioAnalysisData ? (
            <WalletNotice isLoadingParentQueries={isLoadingPortfolioAnalysis} />
          ) : (
            <RecentActivityFeed portfolioAnalysisData={portfolioAnalysisData} />
          )}
        </div>
      </div>
    </div>
  );
}
