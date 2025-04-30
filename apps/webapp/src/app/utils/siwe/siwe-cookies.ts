import Cookies from 'js-cookie';
import { SIWESession } from '@reown/appkit-siwe';
import { BASE_CHAIN_ID } from '@wiretap/config';
import { decodeJwt } from '../jwt/verify-jwt';
import { VerifySiweMessageJwtPayload } from './types';
import { SIWE_VALIDITY_MS } from './constants';

/**
 * Key to access specific wallet's SIWE cookie
 */
const SIWE_ACCOUNT_COOKIE_KEY = (address: string, chainId = BASE_CHAIN_ID) =>
  `siwe_account_${address}_${chainId}`;

/**
 * Key to access currently active session's SIWE cookie
 */
const SIWE_SESSION_KEY = 'siwe_session';

/**
 * Get specific account's SIWE cookie as JWT
 */
export const getSiweAccountCookieJwt = (
  address: string | undefined
): string | undefined => {
  if (!address) return undefined;

  return Cookies.get(SIWE_ACCOUNT_COOKIE_KEY(address));
};

/**
 * Get specific account's SIWE cookie as object containing message, address & signature
 */
export const getDecodedSiweAccountCookie = (
  address: string | undefined
): VerifySiweMessageJwtPayload | undefined => {
  if (!address) return undefined;

  const encodedSiweJwt = getSiweAccountCookieJwt(address);

  if (encodedSiweJwt) {
    const decodedJwt = decodeJwt<VerifySiweMessageJwtPayload>(encodedSiweJwt);
    return decodedJwt;
  }
};

/**
 * Set specific account's SIWE cookie
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
 * Get currently active SIWESession cooki
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
 * Set currently active SIWEsession cookie
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
