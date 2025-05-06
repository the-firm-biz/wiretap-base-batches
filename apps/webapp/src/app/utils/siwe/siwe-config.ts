/* eslint-disable require-await */
// @reown/appkit-siwe has typed the config functions as async when they don't need to be.

import { generateNonce, SiweMessage } from 'siwe';
import {
  createSIWEConfig,
  formatMessage,
  SIWECreateMessageArgs
} from '@reown/appkit-siwe';
import { trpcClientUtils } from '@/app/trpc-clients/trpc-react-client';
import {
  getDecodedSiweSessionCookie,
  removeSiweSessionCookie,
  setSiweSessionCookie
} from './siwe-cookies';
import { SIWE_VALIDITY_MS } from './constants';
import { base, baseSepolia } from 'viem/chains';

/**
 * https://docs.reown.com/appkit/javascript/core/siwe#sign-in-with-ethereum
 */
export const siweConfig = createSIWEConfig({
  /**
   * Defines various params passed to createMessage below
   */
  getMessageParams: async () => {
    const expirationISOString = new Date(
      Date.now() + SIWE_VALIDITY_MS
    ).toISOString();

    return {
      domain: window.location.host,
      uri: window.location.origin,
      chains: [base.id, baseSepolia.id],
      statement: 'Please sign with your account',
      exp: expirationISOString
    };
  },

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
   * Called after wallet has signed message.
   * Verifies the signature and signs a JWT on the BE to be stored in cookies.
   */
  verifyMessage: async ({ message, signature }) => {
    try {
      const { success } = await new SiweMessage(message).verify({ signature });

      if (!success) {
        throw new Error('verifyMessage:: Signature verification failed');
      }

      const authJwt = await trpcClientUtils.verifySiweMessage.fetch({
        signature,
        message
      });

      setSiweSessionCookie(authJwt);
      return success;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * The connected account's address and chainId are stored in a cookie.
   * This method retrieves the cookie and returns it as a SIWESession object.
   */
  getSession: async () => {
    const accountCookie = getDecodedSiweSessionCookie();
    if (!accountCookie) {
      return null;
    }

    const { success } = await new SiweMessage(accountCookie.message).verify({
      signature: accountCookie.signature
    });
    if (success) {
      return {
        address: accountCookie.address,
        chainId: accountCookie.chainId
      };
    }

    return null;
  },

  /** Should destroy user session cookie */
  signOut: async () => {
    removeSiweSessionCookie();
    return true;
  },

  /**
   * @note HackVP - disconnecting on account change is the simplest way
   * to keep the session in sync and the connected wallet signed in.
   */
  signOutOnDisconnect: true,
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true
});
