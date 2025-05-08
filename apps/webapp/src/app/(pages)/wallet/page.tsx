// @todo jeffrey - remove once not debug UI
'use client';

import { useTRPCClient } from '@/app/trpc-clients/trpc-react-client';
import { signMessage } from '@wagmi/core';
import { useAccount } from 'wagmi';
import { wagmiConfig } from '@/app/utils/wagmi';

import { Hex } from 'viem';

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
      <button onClick={() => handleGetSignatureClick()}>
        Get Signature & Create Portfolio
      </button>
    </div>
  );
}
