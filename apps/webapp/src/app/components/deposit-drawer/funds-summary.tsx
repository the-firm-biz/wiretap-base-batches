'use client';

import { EthIcon } from '@/app/components/icons/EthIcon';
import { Skeleton } from '@/app/components/ui/skeleton';
import { textStyles } from '@/app/styles/template-strings';
import { formatAddress } from '@/app/utils/format/format-address';
import { formatUnits } from '@/app/utils/format/format-units';
import { useAccount, useBalance } from 'wagmi';

export function DepositDrawerFundsSummary() {
  const { address, chain } = useAccount();

  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address
    }
  });

  const ethDisplayValue = formatUnits(balance?.value || BigInt(0), 18, 4);

  return (
    <div className="flex flex-col gap-4 px-3 py-2 border-x-1 border-y-1 border-border border-dashed rounded-lg">
      {address && (
        <p className={`${textStyles.label}`}>
          From connected wallet {formatAddress(address)}
        </p>
      )}
      <div className="flex flex-row items-center gap-2 w-full">
        <EthIcon className="size-8" />
        <div className="flex flex-col w-full">
          <div className="flex flex-row justify-between items-center w-full">
            <p className={textStyles['compact-mid']}>ETH</p>
            {isLoadingBalance ? (
              <Skeleton className="h-[40px] w-[124px]" />
            ) : (
              <p className={`${textStyles['code-01']}`}>
                {ethDisplayValue} ETH
              </p>
            )}
          </div>
          <div className="flex flex-row justify-between items-center w-full">
            <p className={textStyles['label']}>{chain?.name}</p>
            <p className={textStyles['label']}>available</p>
          </div>
        </div>
      </div>
    </div>
  );
}
