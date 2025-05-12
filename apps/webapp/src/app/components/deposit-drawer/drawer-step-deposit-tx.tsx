'use client';

import {
  SetStateAction,
  Dispatch,
  useEffect,
  useMemo,
  useState,
  memo,
  useRef
} from 'react';
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt
} from 'wagmi';
import { DepositDrawerState } from './deposit-drawer';
import Image from 'next/image';
import { textStyles } from '@/app/styles/template-strings';
import AnimatedEllipsisText from '../animated-ellipsis-text';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { parseEther } from 'viem';
import { formatUsd } from '@/app/utils/format/format-usd';
import { useQuery } from '@tanstack/react-query';
import { TriangleAlertIcon } from '../icons/TriangleAlertIcon';
import { cn } from '@/app/utils';
import { BaseError } from '@wagmi/core';
import { Button } from '../ui/button';
import { DrawerDescription, DrawerTitle } from '../ui/drawer';

interface DepositDrawerProps {
  setDepositDrawerState: Dispatch<SetStateAction<DepositDrawerState>>;
  depositDrawerState: DepositDrawerState;
}

export const DrawerStepDepositTransaction = memo(
  function DrawerStepDepositTransaction({
    setDepositDrawerState,
    depositDrawerState
  }: DepositDrawerProps) {
    const hasCalledHandler = useRef(false);

    const amountEthToDeposit = 0.01;
    const gliderPortfolioAddress = '0x0591eDeF86a68597336Fa37a356843b86fFC1a4e';

    // const { address } = useAccount();
    // const trpc = useTRPC();
    // const {
    //   data: hash,
    //   isPending: isTxPending,
    //   isError: isTxError,
    //   error: txError,
    //   sendTransaction
    // } = useSendTransaction();
    // const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } =
    //   useWaitForTransactionReceipt({
    //     hash
    //   });
    const [
      hasDeclaritivelyCalledSendTransaction,
      setHasDeclaritivelyCalledSendTransaction
    ] = useState(false);

    // const { data: ethPriceUsd } = useQuery(
    //   trpc.app.getEthPriceUsd.queryOptions()
    // );
    // const usdDisplayValue =
    //   formatUsd();
    // depositDrawerState.amountEthToDeposit * (ethPriceUsd || 0)
    // amountEthToDeposit * (ethPriceUsd || 0)

    // const memoisedTxData = useMemo(() => {
    //   const { gliderPortfolioAddress, amountEthToDeposit } = depositDrawerState;

    //   return {
    //     depositAddress: gliderPortfolioAddress,
    //     amountEthToDeposit: parseEther(amountEthToDeposit.toString())
    //   };
    // }, [depositDrawerState]);

    console.count('DrawerStep RENDER');
    console.log('hasCalledHandler', hasCalledHandler.current);
    hasCalledHandler.current = true;
    // console.log({ isTxPending, isTxConfirming, isTxConfirmed });

    useEffect(() => {
      const handleDeposit = () => {
        // setHasDeclaritivelyCalledSendTransaction(true);
        // Should not be possible to get here
        // if (!memoisedTxData.depositAddress) {
        //   throw new Error(
        //     `GliderPortfolio not found for address: ${memoisedTxData.depositAddress}`
        //   );
        // }
        // Create the transfer transaction
        // sendTransaction({
        //   to: gliderPortfolioAddress,
        //   value: parseEther(amountEthToDeposit.toString())
        // });
        // sendTransaction({
        //   to: memoisedTxData.depositAddress,
        //   value: memoisedTxData.amountEthToDeposit
        // });
        // console.log('SUCCESS');
      };

      // A hack to prevent the useEffect firing twice when the parent re-renders
      if (!hasDeclaritivelyCalledSendTransaction) {
        console.count('calling handleDeposit');
        // handleDeposit();
      }
    }, []);

    // const getImage = () => {
    //   if (isTxError) {
    //     return (
    //       <div className="flex items-center justify-center p-2 rounded-md border border-border">
    //         <TriangleAlertIcon className="size-[24px]" />
    //       </div>
    //     );
    //   }

    //   if (isTxConfirming) {
    //     return (
    //       <Image
    //         src={'/transfer.png'}
    //         alt="Commerce taking place"
    //         width={128}
    //         height={128}
    //       />
    //     );
    //   }

    //   return (
    //     <Image
    //       src={'/handshake.png'}
    //       alt="Commerce taking place"
    //       width={128}
    //       height={128}
    //     />
    //   );
    // };

    // const getTitleText = () => {
    //   if (isTxError) {
    //     return <span className={textStyles['title3']}>Error</span>;
    //   }

    //   if (isTxConfirmed) {
    //     return <span className={textStyles['title3']}>Deposit Complete</span>;
    //   }

    //   if (isTxConfirming) {
    //     return (
    //       <AnimatedEllipsisText className={textStyles['title3']}>
    //         Depositing
    //       </AnimatedEllipsisText>
    //     );
    //   }

    //   return <span className={textStyles['title3']}>Confirm Transaction</span>;
    // };

    // const getDescriptionText = () => {
    //   if (isTxError) {
    //     const txErrorShortMessage = (txError as BaseError).shortMessage;

    //     return (
    //       <p className={cn(textStyles['compact'], 'text-center')}>
    //         {txErrorShortMessage || 'An unknown error occurred'}
    //       </p>
    //     );
    //   }

    //   if (isTxConfirmed) {
    //     return (
    //       <p className={textStyles['compact']}>
    //         You may now return to your business.
    //         <br />
    //         Good day!
    //       </p>
    //     );
    //   }

    //   if (isTxConfirming) {
    //     return (
    //       <AnimatedEllipsisText className={textStyles['compact']}>
    //         Transferring funds to your WireTap wallet
    //       </AnimatedEllipsisText>
    //     );
    //   }

    //   return (
    //     <p className={textStyles['compact']}>
    //       Kindly open wallet app to confirm transfer:
    //     </p>
    //   );
    // };

    // const getDepositBalanceText = () => {
    //   if (isTxConfirmed || isTxError) {
    //     return null;
    //   }

    //   return (
    //     <p className={textStyles['compact-emphasis']}>
    //       {/* {depositDrawerState.amountEthToDeposit} ETH (${usdDisplayValue}) */}
    //     </p>
    //   );
    // };

    // const getCta = () => {
    //   if (isTxError) {
    //     return (
    //       <div className="mt-4">
    //         <Button
    //           variant="outline"
    //           onClick={() =>
    //             sendTransaction({
    //               to: gliderPortfolioAddress,
    //               value: parseEther(amountEthToDeposit.toString())
    //               // to: memoisedTxData.depositAddress,
    //               // value: memoisedTxData.amountEthToDeposit
    //             })
    //           }
    //         >
    //           Try again
    //         </Button>
    //       </div>
    //     );
    //   }

    //   if (isTxConfirmed) {
    //     return <Button>Pleasure Doing Business</Button>;
    //   }

    //   return null;
    // };

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6">
        {/* Visually hidden title & description */}
        <DrawerTitle className="sr-only">Deposit Funds</DrawerTitle>
        <DrawerDescription className="sr-only">
          Confirm transaction and deposit to your Glider Portfolio
        </DrawerDescription>
        {/* End visually hidden title & description */}
        {/* {getImage()}
        <div className="flex flex-col items-center justify-center gap-2">
          {getTitleText()}
          {getDescriptionText()}
          {getDepositBalanceText()}
          {getCta()}
        </div> */}
      </div>
    );
  },
  (prevProps, nextProps) => {
    console.log('memo- prevProps', prevProps);
    console.log('memo- nextProps', nextProps);
    return true;
  }
);
