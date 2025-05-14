'use client';

import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import Image from 'next/image';
import { textStyles } from '@/app/styles/template-strings';
import { trpcClientUtils, useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { DrawerDescription, DrawerTitle } from '../ui/drawer';
import { formatAddress } from '@/app/utils/format/format-address';

interface WithdrawDrawerProps {
  setDrawerIsOpen: (isOpen: boolean) => void;
}

export const WithdrawDrawerContent = ({
  setDrawerIsOpen
}: WithdrawDrawerProps) => {
  const { address } = useAccount();
  const trpc = useTRPC();

  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery(
    trpc.wireTapAccount.getAuthedAccountGliderPortfolio.queryOptions()
  );

  const { mutate: withdrawAllEth, isPending: isWithdrawing } = useMutation(
    trpc.glider.withdrawAllEthFromGliderPortfolio.mutationOptions({
      onSuccess: () => {
        setDrawerIsOpen(false);
        trpcClientUtils.glider.invalidate();
        toast(
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className={textStyles['compact-emphasis']}>
                Withdrawal Complete
              </div>
              <div className={textStyles.label}>
                Withdrawn to wallet {!!address && formatAddress(address)}
              </div>
            </div>
          </div>
        );
      },
      onError: () => {
        toast(
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className={textStyles['compact-emphasis']}>
                Failed to withdraw
              </div>
              <div className={textStyles.label}>Please try again</div>
            </div>
          </div>
        );
      }
    })
  );

  const getCta = () => {
    if (isWithdrawing) {
      return (
        <div className="mt-4 w-full">
          <Button variant="outline" className="w-full" disabled={isWithdrawing}>
            Working On It
          </Button>
        </div>
      );
    }
    return (
      <div className="mt-4 w-full">
        <Button
          className="w-full"
          disabled={isLoadingPortfolio || !portfolio?.id}
          onClick={() => {
            withdrawAllEth({ portfolioId: portfolio!.id });
          }}
        >
          Yes Please
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-6">
      {/* Visually hidden title & description */}
      <DrawerTitle className="sr-only">Withdraw Funds</DrawerTitle>
      <DrawerDescription className="sr-only">
        Confirm you would like to withdraw all ETH to your wallet
      </DrawerDescription>
      {/* End visually hidden title & description */}
      <Image
        src="/deposit.png"
        alt="Business Gentleman with Wallet"
        width={128}
        height={128}
      />
      <div className="flex flex-col items-center justify-center gap-2">
        <span className={textStyles['title3']}>
          Withdraw All ETH to Wallet?
        </span>
        <p className={textStyles['compact']}>
          Withdrawing to connected wallet {!!address && formatAddress(address)}
        </p>
        {getCta()}
      </div>
    </div>
  );
};
