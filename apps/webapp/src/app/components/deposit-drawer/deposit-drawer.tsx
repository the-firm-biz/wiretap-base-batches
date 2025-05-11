import {
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  Drawer
} from '../ui/drawer';
import { ReactNode } from 'react';
import { DepositDrawerFundsSummary } from './deposit-drawer-funds-summary';

interface DepositDrawerProps {
  trigger: ReactNode;
}

export function DepositDrawer({ trigger }: DepositDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="flex flex-col">
          <DrawerTitle>Deposit Funds</DrawerTitle>
          <div className="mt-6" />
          <DepositDrawerFundsSummary />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
