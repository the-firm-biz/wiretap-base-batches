'use client';

import { useEffect, useState, useRef } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { DepositState } from './deposit-drawer';
import Image from 'next/image';
import { textStyles } from '@/app/styles/template-strings';
import AnimatedEllipsisText from '../animated-ellipsis-text';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { Address, parseEther } from 'viem';
import { formatUsd } from '@/app/utils/format/format-usd';
import { useQuery } from '@tanstack/react-query';
import { TriangleAlertIcon } from '../icons/TriangleAlertIcon';
import { cn } from '@/app/utils';
import { BaseError } from '@wagmi/core';
import { Button } from '../ui/button';
import { DrawerDescription, DrawerTitle } from '../ui/drawer';

interface DepositDrawerProps {
  handleOpenCloseDrawer: (isOpen: boolean) => void;
  depositState: DepositState;
}

export const DrawerStepDepositTransaction = ({
  handleOpenCloseDrawer,
  depositState
}: DepositDrawerProps) => {
  const trpc = useTRPC();

  // A hack to prevent calling sendTransaction twice
  const hasDeclaritivelyCalledSendTransaction = useRef(false);

  // useSendTransaction is not causing re-renders, so we are setting our own state using mutation callbacks
  const [txError, setTxError] = useState<BaseError | null>(null);
  const [txHash, setTxHash] = useState<Address | null>(null);

  const isTxError = !!txError;

  const { amountEthToDeposit, gliderPortfolioAddress } = depositState;

  const { sendTransaction } = useSendTransaction({
    mutation: {
      onError: (error: unknown) => {
        const baseError = error as BaseError;
        // @todo sonner - style and add button
        toast.error(`Error. ${baseError.shortMessage}`);
        setTxError(baseError);
      },
      onSuccess: (hash: Address) => {
        setTxHash(hash);
      }
    }
  });

  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash!,
      query: {
        enabled: !!txHash
      }
    });

  const { data: ethPriceUsd } = useQuery(
    trpc.app.getEthPriceUsd.queryOptions()
  );
  const usdDisplayValue = formatUsd(amountEthToDeposit * (ethPriceUsd || 0));

  // Declaritively call sendTransaction
  useEffect(() => {
    const handleDeposit = () => {
      // Condition should never be met
      if (!gliderPortfolioAddress) {
        throw new Error(`GliderPortfolio is ${gliderPortfolioAddress}`);
      }

      sendTransaction({
        to: gliderPortfolioAddress,
        value: parseEther(amountEthToDeposit.toString())
      });

      hasDeclaritivelyCalledSendTransaction.current = true;
    };

    if (!hasDeclaritivelyCalledSendTransaction.current) {
      handleDeposit();
    }
  }, [amountEthToDeposit, gliderPortfolioAddress, sendTransaction]);

  // On tx confirmation - success lifecycle event
  useEffect(() => {
    if (isTxConfirmed) {
      toast(
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-col gap-1">
            <div className={textStyles['compact-emphasis']}>
              Deposit Complete
            </div>
            <div className={textStyles.label}>${amountEthToDeposit} ETH</div>
          </div>
        </div>
      );
    }
  }, [amountEthToDeposit, isTxConfirmed]);

  const getImage = () => {
    if (isTxError) {
      return (
        <div className="flex items-center justify-center p-2 rounded-md border border-border">
          <TriangleAlertIcon className="size-[24px]" />
        </div>
      );
    }
    if (isTxConfirming) {
      return (
        <Image
          src={'/transfer.png'}
          alt="Commerce taking place"
          width={128}
          height={128}
        />
      );
    }
    return (
      <Image
        src={'/handshake.png'}
        alt="Commerce taking place"
        width={128}
        height={128}
      />
    );
  };

  const getTitleText = () => {
    if (isTxError) {
      return <span className={textStyles['title3']}>Error</span>;
    }
    if (isTxConfirmed) {
      return <span className={textStyles['title3']}>Deposit Complete</span>;
    }
    if (isTxConfirming) {
      return (
        <AnimatedEllipsisText className={textStyles['title3']}>
          Depositing
        </AnimatedEllipsisText>
      );
    }
    return <span className={textStyles['title3']}>Confirm Transaction</span>;
  };

  const getDescriptionText = () => {
    if (isTxError) {
      return (
        <p className={cn(textStyles['compact'], 'text-center')}>
          {txError.shortMessage || 'An unknown error occurred'}
        </p>
      );
    }
    if (isTxConfirmed) {
      return (
        <p className={`${textStyles['compact']} text-center`}>
          You may now return to your business.
          <br />
          Good day!
        </p>
      );
    }
    if (isTxConfirming) {
      return (
        <AnimatedEllipsisText className={textStyles['compact']}>
          Transferring funds to your WireTap wallet
        </AnimatedEllipsisText>
      );
    }
    return (
      <p className={textStyles['compact']}>
        Kindly open wallet app to confirm transfer:
      </p>
    );
  };

  const getDepositBalanceText = () => {
    if (isTxConfirmed || isTxError) {
      return null;
    }
    return (
      <p className={textStyles['compact-emphasis']}>
        {depositState.amountEthToDeposit} ETH (${usdDisplayValue})
      </p>
    );
  };

  const getCta = () => {
    if (isTxError) {
      return (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setTxError(null);
              sendTransaction({
                to: gliderPortfolioAddress,
                value: parseEther(amountEthToDeposit.toString())
              });
            }}
          >
            Try again
          </Button>
        </div>
      );
    }
    if (isTxConfirmed) {
      return (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setTxError(null);
              setTxHash(null);
              handleOpenCloseDrawer(false);
            }}
          >
            Pleasure Doing Business
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-6">
      {/* Visually hidden title & description */}
      <DrawerTitle className="sr-only">Deposit Funds</DrawerTitle>
      <DrawerDescription className="sr-only">
        Confirm transaction and deposit to your Glider Portfolio
      </DrawerDescription>
      {/* End visually hidden title & description */}
      {getImage()}
      <div className="flex flex-col items-center justify-center gap-2">
        {getTitleText()}
        {getDescriptionText()}
        {getDepositBalanceText()}
        {getCta()}
      </div>
    </div>
  );
};
