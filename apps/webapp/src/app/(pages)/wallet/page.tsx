// @todo jeffrey - remove once not debug UI
'use client';

import { useTRPC } from '@/app/trpc-clients/trpc-react-client';

import { GliderPortfolioBalance } from './components/glider-portfolio-balance';
import { Button } from '@/app/components/ui/button';
import { DownloadIcon } from '@/app/components/icons/DownloadIcon';
import { UploadIcon } from '@/app/components/icons/UploadIcon';
import { DepositDrawer } from '@/app/components/deposit-drawer/deposit-drawer';
import { useQuery } from '@tanstack/react-query';

export default function WalletPage() {
  const trpc = useTRPC();

  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery(
    trpc.wireTapAccount.getGliderPortfolioForAuthedAccount.queryOptions()
  );

  return (
    <div>
      <div className="bg-accent p-4">
        <div className="flex flex-col gap-4 max-w-screen-md w-full mx-auto py-2">
          <GliderPortfolioBalance />
          <div className="flex gap-2">
            <DepositDrawer
              trigger={
                <Button disabled={isLoadingPortfolio} variant="outline">
                  <DownloadIcon className="size-4" /> Deposit
                </Button>
              }
            />
            <Button
              // @todo withdraw - check portfolio balance
              disabled={isLoadingPortfolio || !portfolio}
              variant="outline"
            >
              <UploadIcon className="size-4" /> Withdraw
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
