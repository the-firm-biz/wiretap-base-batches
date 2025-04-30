import { generateNonce, SiweMessage } from 'siwe';
import {
  type SIWESession,
  type SIWEVerifyMessageArgs,
  type SIWECreateMessageArgs,
  createSIWEConfig
} from '@reown/appkit-siwe';
import {
  getSiweAccountCookie,
  getSiweSessionCookie,
  removeSiweAccountCookie,
  removeSiweSessionCookie,
  setSiweAccountCookie
} from './siwe-cookies';
import { setSiweSessionCookie } from './siwe-cookies';
import { trpcClientUtils } from '@/app/trpc-clients/trpc-react-client';

export const SIWE_VALIDITY_MS = 60 * 1000;
export const SIWE_MESSAGE = 'Please sign with your account';

/* Create a SIWE configuration object */
export const siweConfig = createSIWEConfig({
  // @todo - this may do nothing

  getMessageParams: async () => ({
    domain: window.location.host,
    uri: window.location.origin,
    chains: [1, 2020],
    statement: 'Please sign with your account'
  }),

  createMessage: ({ nonce, address, chainId }) => {
    const expirationTime = new Date(
      Date.now() + SIWE_VALIDITY_MS
    ).toISOString();
    return new SiweMessage({
      version: '1',
      domain: window.location.host,
      uri: window.location.origin,
      address,
      chainId,
      nonce,
      expirationTime,
      // Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
      statement: SIWE_MESSAGE
    }).prepareMessage();
  },

  getNonce: async () => awaitgenerateNonce(),

  getSession: async () => {
    const sessionCookie = getSiweSessionCookie();
    if (!sessionCookie) {
      return null;
    }

    const accountCookie = getSiweAccountCookie(sessionCookie?.address);
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
   * Called during sign in after wallet has created signature
   */
  verifyMessage: async ({ message, signature }) => {
    try {
      const { success } = await new SiweMessage(message).verify({ signature });
      if (success) {
        const { address, chainId } = new SiweMessage(message);
        const authJwt = await trpcClientUtils.verifySiweMessage.fetch({
          signature,
          message
        });
        setSiweAccountCookie(address, authJwt);
        setSiweSessionCookie(address, chainId);
      }
      return success;
    } catch (e) {
      console.error('verifyMessage', e);
      return false;
    }
  },

  /** Should destroy user session */
  signOut: async () => {
    const sessionCookie = getSiweSessionCookie();

    if (!sessionCookie) {
      console.log('signOut- NO SESSION COOKIE');
      // @todo - log and test
      return false;
    }

    const accountCookie = getSiweAccountCookie(sessionCookie.address);
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
