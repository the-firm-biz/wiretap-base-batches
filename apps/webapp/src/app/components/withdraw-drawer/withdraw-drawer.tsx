'use client';

import { DrawerContent, DrawerTrigger, Drawer } from '../ui/drawer';
import { ReactNode, useState, memo } from 'react';
import { WithdrawDrawerContent } from './withdraw-drawer-content';

interface WithdrawDrawerProps {
  trigger: ReactNode;
}

const WithdrawDrawerComponent = ({ trigger }: WithdrawDrawerProps) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  return (
    <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <WithdrawDrawerContent setDrawerIsOpen={setDrawerIsOpen} />
      </DrawerContent>
    </Drawer>
  );
};

export const WithdrawDrawer = memo(WithdrawDrawerComponent);
