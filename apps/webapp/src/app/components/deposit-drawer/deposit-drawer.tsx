'use client';

import { DrawerContent, DrawerTrigger, Drawer } from '../ui/drawer';
import { ReactNode, useState } from 'react';
import { Address } from 'viem';
import { DrawerStepInputDepositAmount } from './drawer-step-input-deposit-amount';
import { DrawerStepSignGliderMessage } from './drawer-step-sign-glider-message';
import { DrawerStepDepositTransaction } from './drawer-step-deposit-tx';

interface DepositDrawerProps {
  trigger: ReactNode;
}

export type DepositDrawerStep =
  | 'input-deposit-amount'
  | 'sign-glider-message'
  | 'confirm-deposit-tx';

export interface DepositState {
  step: DepositDrawerStep;
  amountEthToDeposit: number;
  gliderPortfolioAddress: Address | undefined;
}

export const DEFAULT_STATE: DepositState = {
  step: 'input-deposit-amount',
  amountEthToDeposit: 0,
  gliderPortfolioAddress: undefined
};

export const DepositDrawer = ({ trigger }: DepositDrawerProps) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [depositState, setDepositState] = useState<DepositState>(DEFAULT_STATE);

  return (
    <Drawer
      open={drawerIsOpen}
      onOpenChange={(open) => {
        setDrawerIsOpen(open);
        // Reset state after the drawer's closing animation is complete
        setTimeout(() => {
          setDepositState(DEFAULT_STATE);
        }, 500);
      }}
    >
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        {depositState?.step === 'input-deposit-amount' && (
          <DrawerStepInputDepositAmount setDepositState={setDepositState} />
        )}
        {depositState?.step === 'sign-glider-message' && (
          <DrawerStepSignGliderMessage setDepositState={setDepositState} />
        )}
        {depositState?.step === 'confirm-deposit-tx' && (
          <DrawerStepDepositTransaction
            setDrawerIsOpen={setDrawerIsOpen}
            setDepositState={setDepositState}
            depositState={depositState}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
};
