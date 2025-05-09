// @todo jeffrey - remove once not debug UI
'use client';

import { useTRPCClient } from '@/app/trpc-clients/trpc-react-client';
import { signMessage } from '@wagmi/core';
import { useAccount } from 'wagmi';
import { wagmiConfig } from '@/app/utils/wagmi';

import { Hex } from 'viem';
import { GliderPortfolioBalance } from './components/glider-portfolio-balance';
import { Button } from '@/app/components/ui/button';

export default function WalletPage() {
  const { address } = useAccount();
  const trpc = useTRPCClient();

  // @todo jeffrey - implement real UI not debug UI
  const handleGetSignatureClick = async () => {
    const response =
      await trpc.glider.getGliderCreatePortfolioSignatureData.query();

    const signature = await signMessage(wagmiConfig, {
      account: address,
      message: { raw: response.signatureAction.message.raw as Hex }
    });

    const createdPortfolio = await trpc.glider.createGliderPortfolio.mutate({
      signature,
      signatureAction: response.signatureAction,
      agentAddress: response.agentAddress,
      accountIndex: response.accountIndex
    });

    console.log(createdPortfolio);
  };

  return (
    <div>
      <div className="bg-accent pb-4">
        <div className="flex flex-col gap-4 max-w-screen-md w-full mx-auto py-2">
          <GliderPortfolioBalance />
        </div>
      </div>
      <div className="p-4">
        <Button onClick={() => handleGetSignatureClick()}>
          Get Signature & Create Portfolio
        </Button>
      </div>
    </div>
  );
}
