import Cookies from 'js-cookie';
import { SIWESession } from '@reown/appkit-siwe';
import { BASE_CHAIN_ID } from '@wiretap/config';
import { SIWE_VALIDITY_MS } from './siwe-config';
import { decodeJwt } from '../jwt/verify-jwt';
import { VerifySiweMessageJwtPayload } from '@/server/api/routes/verify-siwe-message';

export const SIWE_ACCOUNT_COOKIE_KEY = (address: string, chainId = 1) =>
  `siwe_${address}_${chainId}`;

export const SIWE_SESSION_KEY = 'siwe_session';

/**
 * Get specific account's SIWE sign in data
 */
export const getSiweAccountCookie = (
  address: string | undefined
): VerifySiweMessageJwtPayload | undefined => {
  if (!address) return undefined;

  const encodedData = Cookies.get(SIWE_ACCOUNT_COOKIE_KEY(address));

  if (encodedData) {
    const decodedJwt = decodeJwt<VerifySiweMessageJwtPayload>(encodedData);
    return decodedJwt;
  }
};

/**
 * @todo this and the above should be renamed and refactored
 */
export const getSiweAccountJwt = (
  address: string | undefined
): string | undefined => {
  if (!address) return undefined;

  return Cookies.get(SIWE_ACCOUNT_COOKIE_KEY(address));
};

/**
 * Set specific account's SIWE sign in data
 */
export const setSiweAccountCookie = (
  address: string,
  authJwt: string
): void => {
  const { exp } = decodeJwt<VerifySiweMessageJwtPayload>(authJwt);
  const expiresDate = new Date(exp ? exp * 1000 : SIWE_VALIDITY_MS);

  Cookies.set(SIWE_ACCOUNT_COOKIE_KEY(address), authJwt, {
    expires: expiresDate,
    sameSite: 'strict',
    secure: true
  });
};

/**
 * Remove account's SIWE cookie
 */
export const removeSiweAccountCookie = (
  address: string,
  chainId = BASE_CHAIN_ID
) => Cookies.remove(SIWE_ACCOUNT_COOKIE_KEY(address, chainId));

/**
 * Get SIWE session cookie
 */
export const getSiweSessionCookie = (): SIWESession | undefined => {
  const encodedData = Cookies.get(SIWE_SESSION_KEY);
  if (encodedData) {
    const dataString = decodeURIComponent(encodedData);
    const data = JSON.parse(dataString);
    return data;
  }
};

/**
 * Set SIWE session cookie
 */
export const setSiweSessionCookie = (
  address: string,
  chainId = BASE_CHAIN_ID
): void => {
  const value = JSON.stringify({ address, chainId });
  Cookies.set(SIWE_SESSION_KEY, value, {
    expires: undefined, // Expires after session
    sameSite: 'strict',
    secure: true
  });
};

/**
 * Remove SIWE session cookie
 */
export const removeSiweSessionCookie = () => Cookies.remove(SIWE_SESSION_KEY);
