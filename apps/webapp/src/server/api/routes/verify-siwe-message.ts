import { SiweMessage } from 'siwe';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import jsonwebtoken from 'jsonwebtoken';
import { SIWE_VALIDITY_MS } from '@/app/utils/siwe/siwe-config';
import { serverEnv } from '@/serverEnv';
import { publicProcedure } from '../trpc';

export interface VerifySiweMessageJwtPayload {
  message: string;
  address: string;
  signature: string;
}

/** Returns signed auth JWT to be stored locally */
export const verifySiweMessage = publicProcedure
  .input(
    z.object({
      message: z.string(),
      signature: z.string()
    })
  )
  .query(async ({ input }) => {
    const { message, signature } = input;
    try {
      const validSignature = await new SiweMessage(message).verify({
        signature: signature
      });

      // This could only be hit if external calls are made to this endpoint
      if (!validSignature) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: `Invalid signature. Please disconnect your wallet and re-sign the message.`
        });
      }

      const { address, expirationTime } = new SiweMessage(message);
      const payload: VerifySiweMessageJwtPayload = {
        message,
        address,
        signature
      };
      const expiresInMs = expirationTime
        ? new Date(expirationTime).getTime() - Date.now()
        : SIWE_VALIDITY_MS;
      const expiresInS = Math.floor(expiresInMs / 1000);

      const authJwt = jsonwebtoken.sign(payload, serverEnv.SIWE_JWT_SECRET, {
        algorithm: 'HS256',
        issuer: 'WireTap',
        expiresIn: expiresInS
      });
      return authJwt;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error('login', e);
      throw new TRPCError({
        code: e.code || 'INTERNAL_SERVER_ERROR',
        message: e.message || e
      });
    }
  });
