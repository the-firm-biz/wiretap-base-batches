import Cookies from 'js-cookie';
import { decodeJwt } from '../jwt/verify-jwt';
import { VerifySiweMessageJwtPayload } from './types';
import { SIWE_VALIDITY_MS } from './constants';

/**
 * Key to access currently active  session's SIWE cookie
 */
const SIWE_SESSION_KEY = 'siwe_session';

/**
 * Get SIWE session cookie as JWT
 */
export const getJwtSiweSessionCookie = (): string | undefined =>
  Cookies.get(SIWE_SESSION_KEY);

/**
 * Get SIWE session cookie as object containing message, address & signature
 */
export const getDecodedSiweSessionCookie = ():
  | VerifySiweMessageJwtPayload
  | undefined => {
  const encodedSiweJwt = getJwtSiweSessionCookie();

  if (encodedSiweJwt) {
    try {
      const decodedJwt = decodeJwt<VerifySiweMessageJwtPayload>(encodedSiweJwt);
      return decodedJwt;
    } catch (error) {
      console.error(
        'getDecodedSiweSessionCookie:: Error getting decoding SIWE session cookie',
        error
      );
    }
  }
};

/**
 * Set session's SIWE cookie
 */
export const setSiweSessionCookie = (authJwt: string): void => {
  try {
    const { exp } = decodeJwt<VerifySiweMessageJwtPayload>(authJwt);
    const expiresDate = new Date(exp ? exp * 1000 : SIWE_VALIDITY_MS);

    Cookies.set(SIWE_SESSION_KEY, authJwt, {
      expires: expiresDate,
      sameSite: 'none',
      secure: true
    });
  } catch (error) {
    console.error(
      'setSiweSessionCookie:: Error setting SIWE session cookie',
      error
    );
  }
};

/**
 * Remove SIWE session cookie
 */
export const removeSiweSessionCookie = () => Cookies.remove(SIWE_SESSION_KEY);
