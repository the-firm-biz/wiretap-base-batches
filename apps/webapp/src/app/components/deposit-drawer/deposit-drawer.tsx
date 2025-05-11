import {
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  Drawer
} from '../ui/drawer';
import { ReactNode } from 'react';
import { DepositDrawerFundsSummary } from './deposit-drawer-funds-summary';
import { textStyles } from '@/app/styles/template-strings';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

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
          <div className="mt-8" />
          <div className="flex flex-col gap-2">
            <p className={textStyles['compact-mid']}>Transfer ETH</p>
            <Input inputMode="numeric" />
          </div>
          <div className="mt-[12px]" />
          <div className="flex flex-row gap-1 w-full">
            <Button variant="outline" className="flex-1">
              25%
            </Button>
            <Button variant="outline" className="flex-1">
              50%
            </Button>
            <Button variant="outline" className="flex-1">
              75%
            </Button>
            <Button variant="outline" className="flex-1">
              Max
            </Button>
          </div>
          <div className="mt-8 flex w-full">
            <Button className="flex-1">Confirm Deposit</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
