import { SetStateAction, Dispatch, useEffect, useState, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { DepositState } from './deposit-drawer';
import Image from 'next/image';
import { textStyles } from '@/app/styles/template-strings';
import AnimatedEllipsisText from '../animated-ellipsis-text';
import {
  trpcClientUtils,
  useTRPC,
  useTRPCClient
} from '@/app/trpc-clients/trpc-react-client';
import { Address, Hex } from 'viem';
import { BaseError } from '@wagmi/core';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { TriangleAlertIcon } from '../icons/TriangleAlertIcon';
import { cn } from '@/app/utils';
import { DrawerDescription, DrawerTitle } from '../ui/drawer';
import { useQuery } from '@tanstack/react-query';

interface SignGliderMessageStepProps {
  setDepositState: Dispatch<SetStateAction<DepositState>>;
}

export function DrawerStepSignGliderMessage({
  setDepositState
}: SignGliderMessageStepProps) {
  // A hack to prevent calling sendTransaction twice
  const hasDeclaritivelyCalledSignTransaction = useRef(false);
  const { address } = useAccount();
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();

  const { data: dataToSign } = useQuery(
    trpc.glider.getGliderCreatePortfolioSignatureData.queryOptions(undefined, {
      enabled: !!address
    })
  );

  const [signError, setSignError] = useState<BaseError | null>(null);
  const isSignError = !!signError;

  const { signMessage } = useSignMessage({
    mutation: {
      onError: (error: unknown) => {
        const baseError = error as BaseError;
        toast.error(`Error. ${baseError.shortMessage}`);
        setSignError(baseError);
      },
      onSuccess: async (signature) => {
        try {
          // Should never encounter this scenario
          if (!dataToSign) {
            throw new Error('No signature data found');
          }

          // Create the portfolio
          const createdPortfolio =
            await trpcClient.glider.createGliderPortfolio.mutate({
              signature,
              signatureAction: dataToSign?.signatureAction,
              agentAddress: dataToSign?.agentAddress,
              accountIndex: dataToSign?.accountIndex
            });

          // Invalidate authed user portfolio query
          trpcClientUtils.wireTapAccount.getAuthedAccountGliderPortfolio.invalidate();

          // Progress to the next step
          setDepositState((prev) => ({
            ...prev,
            step: 'confirm-deposit-tx',
            gliderPortfolioAddress: createdPortfolio.address as Address
          }));
        } catch (error) {
          console.error('DrawerStepSignGliderMessage::onSuccess', error);
          toast.error('Failed to create portfolio');
          setSignError(new BaseError('Failed to create portfolio'));
        }
      }
    }
  });

  useEffect(() => {
    const handleSignMessage = () => {
      hasDeclaritivelyCalledSignTransaction.current = true;
      signMessage({
        message: { raw: dataToSign?.signatureAction.message.raw as Hex }
      });
    };

    if (dataToSign && !hasDeclaritivelyCalledSignTransaction.current) {
      handleSignMessage();
    }
  }, [signMessage, trpcClient, dataToSign]);

  const getImage = () => {
    if (isSignError) {
      return (
        <div className="flex items-center justify-center p-2 rounded-md border border-border">
          <TriangleAlertIcon className="size-[24px]" />
        </div>
      );
    }
    return (
      <Image
        src="/signature.png"
        alt="Signing with ink"
        width={128}
        height={128}
      />
    );
  };

  const getTitleText = () => {
    if (isSignError) {
      return <span className={textStyles['title3']}>Error</span>;
    }
    return (
      <AnimatedEllipsisText className={textStyles['title3']}>
        Awaiting Signature
      </AnimatedEllipsisText>
    );
  };

  const getDescriptionText = () => {
    if (isSignError) {
      return (
        <p className={cn(textStyles['compact'], 'text-center')}>
          {signError.shortMessage || 'An unknown error occurred'}
        </p>
      );
    }
    return (
      <p className={textStyles['compact']}>Kindly sign in your wallet app</p>
    );
  };

  const getCta = () => {
    if (isSignError) {
      return (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setSignError(null);
              signMessage({
                message: { raw: dataToSign?.signatureAction.message.raw as Hex }
              });
            }}
          >
            Try again
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-6">
      {/* Start visually hidden title & description */}
      <DrawerTitle className="sr-only">Sign Glider Message</DrawerTitle>
      <DrawerDescription className="sr-only">
        Sign & create Glider Portfolio for your wallet
      </DrawerDescription>
      {/* End visually hidden title & description */}
      {getImage()}
      <div className="flex flex-col items-center justify-center gap-2">
        {getTitleText()}
        {getDescriptionText()}
        {getCta()}
      </div>
    </div>
  );
}
