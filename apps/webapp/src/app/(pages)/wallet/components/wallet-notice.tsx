import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { useQuery } from '@tanstack/react-query';
import { InboxIcon } from '@/app/components/icons/InboxIcon';
import { LocateIcon } from '@/app/components/icons/LocateIcon';
import { textStyles } from '@/app/styles/template-strings';
import { Skeleton } from '@/app/components/ui/skeleton';
import AnimatedEllipsisText from '@/app/components/animated-ellipsis-text';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { DownloadIcon } from '@/app/components/icons/DownloadIcon';
import { DepositDrawer } from '@/app/components/deposit-drawer/deposit-drawer';

export function WalletNotice() {
  const trpc = useTRPC();

  const { data: gliderPortfolio, isLoading: isLoadingPortfolio } = useQuery(
    trpc.wireTapAccount.getAuthedAccountGliderPortfolio.queryOptions()
  );
  const hasZeroPortfolioBalance =
    !gliderPortfolio?.balanceWei ||
    BigInt(gliderPortfolio.balanceWei) === BigInt(0);

  const { data: targets, isLoading: isLoadingTargets } = useQuery(
    trpc.wireTapAccount.getAuthedAccountTargets.queryOptions()
  );
  const hasNoTargets = !targets || targets.length === 0;
  const isLoadingQueries = isLoadingPortfolio || isLoadingTargets;

  const getImage = () => {
    if (isLoadingQueries) {
      return <Skeleton className="size-[42px]" />;
    }

    if (hasZeroPortfolioBalance) {
      return (
        <div className="flex items-center justify-center p-2 rounded-md border border-border">
          <InboxIcon className="size-[24px]" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center p-2 rounded-md border border-border">
        <LocateIcon className="size-[24px]" />
      </div>
    );
  };

  const getTitle = () => {
    if (isLoadingQueries) {
      return <Skeleton className="w-[210px] h-[32px]" />;
    }

    if (hasZeroPortfolioBalance) {
      return <p className={`${textStyles['title3']}`}>Fund Your Wallet</p>;
    }

    if (hasNoTargets) {
      return <p className={`${textStyles['title3']}`}>Choose Your Targets</p>;
    }

    return (
      <AnimatedEllipsisText className={`${textStyles['title3']}`}>
        Tracking in Progress
      </AnimatedEllipsisText>
    );
  };

  const getDescription = () => {
    if (isLoadingQueries) {
      return <Skeleton className="w-[260px] h-[20px]" />;
    }

    if (hasZeroPortfolioBalance || hasNoTargets) {
      return (
        <p className={`${textStyles['compact']}`}>
          WireTap uses your balance to auto-buy tokens at launch.
        </p>
      );
    }

    return (
      <p className={`${textStyles['compact']}`}>No auto-buys complete yet.</p>
    );
  };

  const getCta = () => {
    if (isLoadingQueries) {
      return <Skeleton className="w-[128px] h-[40px]" />;
    }

    if (hasZeroPortfolioBalance) {
      return (
        <DepositDrawer
          trigger={
            <Button variant="outline">
              <DownloadIcon className="size-4" />
              Deposit
            </Button>
          }
        />
      );
    }

    return (
      <Link href={`/discover`} className="flex-1">
        <Button>
          Discover
          <ChevronRight className="size-4" />
        </Button>
      </Link>
    );
  };

  return (
    <div className="border-dotted border-1 rounded-md flex flex-col gap-6 p-6 items-center">
      {getImage()}
      <div className="flex flex-col items-center gap-2">
        {getTitle()}
        {getDescription()}
      </div>
      {getCta()}
    </div>
  );
}
