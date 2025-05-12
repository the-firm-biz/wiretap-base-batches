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

export interface DepositDrawerState {
  step: DepositDrawerStep;
  amountEthToDeposit: number;
  gliderPortfolioAddress: Address | undefined;
}

// @todo reinstate
const DEFAULT_STATE: DepositDrawerState = {
  step: 'input-deposit-amount',
  amountEthToDeposit: 0,
  gliderPortfolioAddress: undefined
};

// const DEFAULT_STATE: DepositDrawerState = {
//   step: 'confirm-deposit-tx',
//   amountEthToDeposit: 0.01,
//   gliderPortfolioAddress: '0x0591eDeF86a68597336Fa37a356843b86fFC1a4e'
// };

export const DepositDrawer = ({ trigger }: DepositDrawerProps) => {
  const [depositDrawerState, setDepositDrawerState] =
    useState<DepositDrawerState>(DEFAULT_STATE);

  console.count('PARENT - DepositDrawer RENDER');

  return (
    <Drawer
      onOpenChange={() => {
        // Reset state after the drawer's closing animation is complete
        setTimeout(() => {
          setDepositDrawerState(DEFAULT_STATE);
        }, 500);
      }}
    >
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        {depositDrawerState?.step === 'input-deposit-amount' && (
          <DrawerStepInputDepositAmount
            setDepositDrawerState={setDepositDrawerState}
          />
        )}
        {depositDrawerState?.step === 'sign-glider-message' && (
          <DrawerStepSignGliderMessage
            setDepositDrawerState={setDepositDrawerState}
          />
        )}
        {depositDrawerState?.step === 'confirm-deposit-tx' && (
          <DrawerStepDepositTransaction
            setDepositDrawerState={setDepositDrawerState}
            depositDrawerState={depositDrawerState}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
};
