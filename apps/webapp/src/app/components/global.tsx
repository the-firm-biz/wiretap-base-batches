'use client';

import React from 'react';
import { useOnAccountChange } from '../hooks/useOnAccountChange';
import {
  getDecodedSiweAccountCookie,
  getSiweSessionCookie,
  setSiweSessionCookie
} from '../utils/siwe/siwe-cookies';
import { siweConfig } from '../utils/siwe/siwe-config';

/**
 * Global, client-side rendered component
 */
const Global = () => {
  // Global 'account change' effects
  useOnAccountChange(async (newAddress) => {
    try {
      const newAddressSiweCookie = getDecodedSiweAccountCookie(newAddress);
      if (newAddressSiweCookie) {
        const ting = await siweConfig.verifyMessage({
          message: newAddressSiweCookie.message,
          signature: newAddressSiweCookie.signature
        });
        console.log('siwe: tingoJONES???', ting);
      }
    } catch (error) {
      console.error(error);
    }
  });

  return <React.Fragment />;
};

export default Global;
