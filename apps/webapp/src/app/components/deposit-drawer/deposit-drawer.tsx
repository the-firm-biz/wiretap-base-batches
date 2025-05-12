import { DrawerContent, DrawerTrigger, Drawer } from '../ui/drawer';
import { ReactNode, useState } from 'react';
import { DrawerStepInputDepositAmount } from './drawer-step-input-deposit-amount';
import { DrawerStepSignGliderMessage } from './drawer-step-sign-glider-message';
import { Address } from 'viem';

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

const DEFAULT_STATE: DepositDrawerState = {
  step: 'input-deposit-amount',
  amountEthToDeposit: 0,
  gliderPortfolioAddress: undefined
};

export function DepositDrawer({ trigger }: DepositDrawerProps) {
  const [depositDrawerState, setDepositDrawerState] =
    useState<DepositDrawerState>(DEFAULT_STATE);

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
      </DrawerContent>
    </Drawer>
  );
}
