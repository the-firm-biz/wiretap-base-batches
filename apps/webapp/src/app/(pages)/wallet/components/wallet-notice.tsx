import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useBalance } from 'wagmi';

export function WalletNotice() {
  const trpc = useTRPC();

  const { data: gliderPortfolio } = useQuery(
    trpc.wireTapAccount.getAuthedAccountGliderPortfolio.queryOptions()
  );

  const { data: portfolioBalance } = useBalance({
    address: gliderPortfolio?.address as Address,
    query: {
      enabled: !!gliderPortfolio?.address
    }
  });

  const getImage = () => {
    if (isTxError) {
      return (
        <div className="flex items-center justify-center p-2 rounded-md border border-border">
          {/* <TriangleAlertIcon className="size-[24px]" /> */}
        </div>
      );
    }
  };

  return (
    <div className="border-dotted border-1 rounded-md flex flex-col gap-6 p-6 ">
      WalletNotice
    </div>
  );
}
