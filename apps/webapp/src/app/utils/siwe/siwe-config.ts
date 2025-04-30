/* eslint-disable require-await */
// @reown/appkit-siwe has typed the config functions as async when they don't need to be.

import { generateNonce, SiweMessage } from 'siwe';
import {
  createSIWEConfig,
  formatMessage,
  SIWECreateMessageArgs
} from '@reown/appkit-siwe';
import { BASE_CHAIN_ID } from '@wiretap/config';
import { trpcClientUtils } from '@/app/trpc-clients/trpc-react-client';
import {
  getDecodedSiweAccountCookie,
  getSiweSessionCookie,
  setSiweSessionCookie,
  removeSiweAccountCookie,
  removeSiweSessionCookie,
  setSiweAccountCookie
} from './siwe-cookies';
import { SIWE_VALIDITY_MS } from './constants';

/**
 * https://docs.reown.com/appkit/javascript/core/siwe#sign-in-with-ethereum
 */
export const siweConfig = createSIWEConfig({
  /**
   * Defines various params passed to createMessage below
   */
  getMessageParams: async () => ({
    domain: window.location.host,
    uri: window.location.origin,
    chains: [BASE_CHAIN_ID],
    // @todo - actual message
    statement: 'Please sign with your account',
    expiry: SIWE_VALIDITY_MS
  }),

  /**
   * Generate an EIP-4361-compatible message,
   * The nonce arg is derived from your getNonce endpoint,
   * while the address and chainId variables are sourced from the presently connected wallet.
   */
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) =>
    formatMessage(args, address),

  /**
   * Generate a nonce for the message using SIWE's helper function.
   * This is a safeguard against spoofing.
   */
  getNonce: async () => generateNonce(),

  /**
   * The connected account's address and chainId are stored in a cookie.
   * This method retrieves them and returns them as a SIWESession object.
   */
  getSession: async () => {
    const sessionCookie = getSiweSessionCookie();
    if (!sessionCookie) {
      return null;
    }

    const accountCookie = getDecodedSiweAccountCookie(sessionCookie?.address);
    if (!accountCookie) {
      return null;
    }

    const { success } = await new SiweMessage(accountCookie.message).verify({
      signature: accountCookie.signature
    });
    if (success) {
      return {
        address: sessionCookie.address,
        chainId: sessionCookie.chainId
      };
    }

    return null;
  },

  /**
   * Called after wallet has signed message.
   * Verifies the signature and signs a JWT on the BE to be stored in cookies.
   */
  verifyMessage: async ({ message, signature }) => {
    try {
      const { success } = await new SiweMessage(message).verify({ signature });

      if (!success) {
        throw new Error('verifyMessage:: Signature verification failed');
      }

      const { address, chainId } = new SiweMessage(message);
      const authJwt = await trpcClientUtils.verifySiweMessage.fetch({
        signature,
        message
      });
      setSiweAccountCookie(address, authJwt);
      setSiweSessionCookie(address, chainId);

      return success;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /** Should destroy user session & account cookies */
  signOut: async () => {
    const sessionCookie = getSiweSessionCookie();

    if (!sessionCookie) {
      console.log('signOut- NO SESSION COOKIE');
      // @todo - log and test
      return false;
    }

    const accountCookie = getDecodedSiweAccountCookie(sessionCookie.address);
    if (accountCookie) {
      removeSiweAccountCookie(sessionCookie.address);
    }

    // @todo does the order of cookie removal matter?
    removeSiweSessionCookie();
    return true;
  },

  signOutOnDisconnect: false,
  signOutOnAccountChange: false,
  signOutOnNetworkChange: false
});
