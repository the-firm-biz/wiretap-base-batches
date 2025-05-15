'use client';

import { DrawerContent, DrawerTrigger, Drawer } from '../ui/drawer';
import { ReactNode, useState, memo } from 'react';
import { Address } from 'viem';
import { DrawerStepInputDepositAmount } from './drawer-step-input-deposit-amount';
import { DrawerStepSignGliderMessage } from './drawer-step-sign-glider-message';
import { DrawerStepDepositTransaction } from './drawer-step-deposit-tx';
import { trpcClientUtils } from '@/app/trpc-clients/trpc-react-client';
import { getTanstackQueryClient } from '@/app/trpc-clients/trpc-react-client';
import { useBalance } from 'wagmi';

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

const DEFAULT_STATE: DepositState = {
  step: 'input-deposit-amount',
  amountEthToDeposit: 0,
  gliderPortfolioAddress: undefined
};

const DepositDrawerComponent = ({ trigger }: DepositDrawerProps) => {
  const queryClient = getTanstackQueryClient();
  const { queryKey: useBalanceQueryKey } = useBalance();

  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [depositState, setDepositState] = useState<DepositState>(DEFAULT_STATE);

  const handleOpenCloseDrawer = (isOpen: boolean) => {
    setDrawerIsOpen(isOpen);
    // Invalidate user balance & portfolio queries
    queryClient.invalidateQueries({ queryKey: useBalanceQueryKey });
    trpcClientUtils.wireTapAccount.invalidate();
    // Reset state after the drawer's closing animation is complete
    setTimeout(() => {
      setDepositState(DEFAULT_STATE);
    }, 400);
  };

  return (
    <Drawer open={drawerIsOpen} onOpenChange={handleOpenCloseDrawer}>
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
            handleOpenCloseDrawer={handleOpenCloseDrawer}
            depositState={depositState}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
};

export const DepositDrawer = memo(DepositDrawerComponent);
