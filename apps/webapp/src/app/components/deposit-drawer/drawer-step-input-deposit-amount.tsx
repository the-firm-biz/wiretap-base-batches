import { SetStateAction, Dispatch } from 'react';
import { DrawerDescription, DrawerTitle } from '../ui/drawer';
import { DepositDrawerFundsSummary } from './funds-summary';
import { EthDepositForm } from './eth-deposit-form';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from '@/app/utils/format/format-units';
import { DepositDrawerState } from './deposit-drawer';

interface InputDepositAmountStepProps {
  setDepositDrawerState: Dispatch<SetStateAction<DepositDrawerState>>;
}

export function DrawerStepInputDepositAmount({
  setDepositDrawerState
}: InputDepositAmountStepProps) {
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
      {/* Start visually hidden description */}
      <DrawerDescription className="sr-only">
        Input amonut to deposit into your Glider Portfolio
      </DrawerDescription>
      {/* End visually hidden description */}
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
