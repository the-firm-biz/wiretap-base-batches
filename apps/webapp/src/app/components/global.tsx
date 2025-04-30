'use client';

import React from 'react';
import { useOnAccountChange } from '../hooks/useOnAccountChange';
import {
  getDecodedSiweAccountCookie,
  getSiweSessionCookie,
  removeSiweSessionCookie,
  setSiweSessionCookie
} from '../utils/siwe/siwe-cookies';
import { handleValidateSiweOnAccountChange } from '../utils/siwe/handle-validate-siwe-on-account-change';
import { useAppKit } from '@reown/appkit/react';
/**
 * Global, client-side rendered component
 */
const Global = () => {
  const { open, close } = useAppKit();

  // Global 'account change' effects
  useOnAccountChange(async (newAddress) => {
    try {
      console.log('siwe: || useOnAccountChange ||');
      await handleValidateSiweOnAccountChange({
        newAddress,
        openAppKitModal: open,
        closeAppKitModal: close
      });
    } catch (error) {
      console.error(error);
    }
  });

  return <React.Fragment />;
};

export default Global;
