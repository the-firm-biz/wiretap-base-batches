import { SetStateAction, Dispatch } from 'react';
import { DrawerTitle } from '../ui/drawer';
import { DepositDrawerFundsSummary } from './funds-summary';
import { EthDepositForm } from './eth-deposit-form';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from '@/app/utils/format/format-units';
import { DepositDrawerState } from './deposit-drawer';

interface DepositDrawerProps {
  setDepositDrawerState: Dispatch<SetStateAction<DepositDrawerState>>;
}

export function DrawerStepInputDepositAmount({
  setDepositDrawerState
}: DepositDrawerProps) {
  const { address } = useAccount();

  const { data: balance } = useBalance({
    address: address,
    query: {
      enabled: !!address
    }
  });

  const balanceAsEth = formatUnits(balance?.value || BigInt(0), 18, 4);

  return (
    <div className="flex flex-col">
      <DrawerTitle>Deposit Funds</DrawerTitle>
      <div className="mt-6" />
      <DepositDrawerFundsSummary />
      <div className="mt-8" />
      <EthDepositForm
        userBalance={balanceAsEth}
        setDepositDrawerState={setDepositDrawerState}
      />
    </div>
  );
}
