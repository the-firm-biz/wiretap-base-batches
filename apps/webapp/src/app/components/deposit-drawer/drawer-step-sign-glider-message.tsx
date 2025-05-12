import { SetStateAction, Dispatch, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { DepositState } from './deposit-drawer';
import Image from 'next/image';
import { textStyles } from '@/app/styles/template-strings';
import AnimatedEllipsisText from '../animated-ellipsis-text';
import {
  trpcClientUtils,
  useTRPCClient
} from '@/app/trpc-clients/trpc-react-client';
import { Address, Hex } from 'viem';
import { wagmiConfig } from '@/app/utils/wagmi';
import { signMessage } from '@wagmi/core';
import { DrawerDescription, DrawerTitle } from '../ui/drawer';

interface SignGliderMessageStepProps {
  setDepositState: Dispatch<SetStateAction<DepositState>>;
}

export function DrawerStepSignGliderMessage({
  setDepositState
}: SignGliderMessageStepProps) {
  const { address } = useAccount();
  const trpcClient = useTRPCClient();

  useEffect(() => {
    const handleGliderPortfolioCreation = async () => {
      // Get the signature data
      const signatureData =
        await trpcClient.glider.getGliderCreatePortfolioSignatureData.query();

      // Sign the message
      const signature = await signMessage(wagmiConfig, {
        account: address,
        message: { raw: signatureData?.signatureAction.message.raw as Hex }
      });

      // Create the portfolio
      const createdPortfolio =
        await trpcClient.glider.createGliderPortfolio.mutate({
          signature,
          signatureAction: signatureData?.signatureAction,
          agentAddress: signatureData?.agentAddress,
          accountIndex: signatureData?.accountIndex
        });

      // Invalidate authed user portfolio query
      trpcClientUtils.wireTapAccount.getAuthedAccountGliderPortfolio.invalidate();

      // Progress to the next step
      setDepositState((prev) => ({
        ...prev,
        step: 'confirm-deposit-tx',
        gliderPortfolioAddress: createdPortfolio.address as Address
      }));
    };

    if (address) {
      handleGliderPortfolioCreation();
    }
  }, [address, setDepositState, trpcClient]);

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-6">
      {/* Start visually hidden title & description */}
      <DrawerTitle className="sr-only">Sign Glider Message</DrawerTitle>
      <DrawerDescription className="sr-only">
        Sign & create Glider Portfolio for your wallet
      </DrawerDescription>
      {/* End visually hidden title & description */}
      <Image
        src="/signature.png"
        alt="Signing with ink"
        width={128}
        height={128}
      />
      <div className="flex flex-col items-center justify-center gap-2">
        <AnimatedEllipsisText className={textStyles['title3']}>
          Awaiting Signature
        </AnimatedEllipsisText>
        <p className={textStyles['compact']}>Kindly sign in your wallet app</p>
      </div>
    </div>
  );
}
