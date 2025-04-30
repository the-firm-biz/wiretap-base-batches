import Cookies from 'js-cookie';
import { decodeJwt } from '../jwt/verify-jwt';
import { VerifySiweMessageJwtPayload } from './types';
import { SIWE_VALIDITY_MS } from './constants';

/**
 * Key to access currently active  session's SIWE cookie
 */
const SIWE_SESSION_KEY = 'siwe_session';

/**
 * Get specific account's SIWE cookie as JWT
 */
// @TODO siwe - rename to 'siweSessionCookie...'
export const getSiweAccountCookieJwt = (): string | undefined =>
  Cookies.get(SIWE_SESSION_KEY);

/**
 * Get specific account's SIWE cookie as object containing message, address & signature
 */
export const getDecodedSiweAccountCookie = ():
  | VerifySiweMessageJwtPayload
  | undefined => {
  const encodedSiweJwt = getSiweAccountCookieJwt();

  if (encodedSiweJwt) {
    const decodedJwt = decodeJwt<VerifySiweMessageJwtPayload>(encodedSiweJwt);
    return decodedJwt;
  }
};

/**
 * Set session's SIWE cookie
 * @TODO siwe match expected SIWESession type {
    address: string;
    chainId: number;
}
 */
export const setSiweAccountCookie = (authJwt: string): void => {
  const { exp } = decodeJwt<VerifySiweMessageJwtPayload>(authJwt);
  const expiresDate = new Date(exp ? exp * 1000 : SIWE_VALIDITY_MS);

  Cookies.set(SIWE_SESSION_KEY, authJwt, {
    expires: expiresDate,
    sameSite: 'strict',
    secure: true
  });
};

/**
 * Remove account's SIWE cookie
 */
export const removeSiweAccountCookie = () => Cookies.remove(SIWE_SESSION_KEY);
