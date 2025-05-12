import {
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  Drawer
} from '../ui/drawer';
import { ReactNode } from 'react';
import { DepositDrawerFundsSummary } from './funds-summary';
import { EthDepositForm } from './eth-deposit-form';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from '@/app/utils/format/format-units';

interface DepositDrawerProps {
  trigger: ReactNode;
}

export function DepositDrawer({ trigger }: DepositDrawerProps) {
  const { address } = useAccount();

  const { data: balance } = useBalance({
    address: address,
    query: {
      enabled: !!address
    }
  });

  const balanceAsEth = formatUnits(balance?.value || BigInt(0), 18, 4);

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="flex flex-col">
          <DrawerTitle>Deposit Funds</DrawerTitle>
          <div className="mt-6" />
          <DepositDrawerFundsSummary />
          <div className="mt-8" />
          <EthDepositForm userBalance={balanceAsEth} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
