import jwonwebtoken, { JwtPayload, Secret } from 'jsonwebtoken';

/**
 * Decode and verify a JWT payload - throw if invalid
 */
export const verifyJwt = <T>(jwt: string, secret: Secret): JwtPayload & T => {
  const decodedJwt = jwonwebtoken.verify(jwt, secret, {
    algorithms: ['HS256'],
    issuer: 'WireTap'
  });

  if (typeof decodedJwt === 'string') {
    throw new Error('Unexpected verifyJwt payload.');
  }

  return decodedJwt as JwtPayload & T;
};

/**
 * Decode a JWT's payload without verifying it
 */
export const decodeJwt = <T>(jwt: string): JwtPayload & T => {
  const decodedJwt = jwonwebtoken.decode(jwt, { complete: true });

  if (!decodedJwt || typeof decodedJwt.payload === 'string') {
    throw new Error('Unexpected decodeJwt payload.');
  }

  return decodedJwt.payload as JwtPayload & T;
};
