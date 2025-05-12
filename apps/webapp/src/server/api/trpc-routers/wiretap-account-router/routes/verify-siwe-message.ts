import { SiweMessage } from 'siwe';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import jsonwebtoken from 'jsonwebtoken';
import { VerifySiweMessageJwtPayload } from '@/app/utils/siwe/types';
import { serverEnv } from '@/serverEnv';
import { publicProcedure } from '../../../trpc';
import { SIWE_VALIDITY_MS } from '@/app/utils/siwe/constants';
import {
  createAccountEntity,
  createWireTapAccount,
  getWallet,
  PooledDbConnection,
  ServerlessDb,
  VerificationSourceIds,
  WireTapAccount
} from '@wiretap/db';
import { Address } from 'viem';

async function getOrCreateWireTapAccount(
  poolDb: ServerlessDb,
  walletAddress: Address
): Promise<WireTapAccount> {
  return await poolDb.transaction(async (tx) => {
    const wallet = await getWallet(tx, walletAddress);

    if (wallet) {
      const wireTapAccount = await createWireTapAccount(tx, {
        accountEntityId: wallet.accountEntityId
      });

      return wireTapAccount;
    }

    const accounts = await createAccountEntity(tx, {
      newWallets: [
        {
          address: walletAddress,
          verificationSourceId: VerificationSourceIds.WireTap
        }
      ],
      newWireTapAccount: {}
    });

    if (!accounts.wireTapAccount) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create wire tap account'
      });
    }

    return accounts.wireTapAccount;
  });
}

/** Returns validated, SIWE compliant, signed JWT to be stored locally */
export const verifySiweMessage = publicProcedure
  .input(
    z.object({
      message: z.string(),
      signature: z.string()
    })
  )
  .query(async ({ input }): Promise<string> => {
    const { message, signature } = input;

    const poolDb = new PooledDbConnection({
      databaseUrl: serverEnv.DATABASE_URL
    });

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

      const { address, expirationTime, chainId } = new SiweMessage(message);

      const wireTapAccount = await getOrCreateWireTapAccount(
        poolDb.db,
        address as `0x${string}`
      );

      const siweJwtPayload: VerifySiweMessageJwtPayload = {
        wireTapAccountId: wireTapAccount.id,
        message,
        address,
        signature,
        chainId
      };

      const expiresInMs = expirationTime
        ? new Date(expirationTime).getTime() - Date.now()
        : SIWE_VALIDITY_MS;

      const expiresInS = Math.floor(expiresInMs / 1000);

      const signedJwt = jsonwebtoken.sign(
        siweJwtPayload,
        serverEnv.SIWE_JWT_SECRET,
        {
          algorithm: 'HS256',
          issuer: 'WireTap',
          expiresIn: expiresInS
        }
      );

      return signedJwt;
    } catch (e: any) {
      console.error('login', e);
      throw new TRPCError({
        code: e.code || 'INTERNAL_SERVER_ERROR',
        message: e.message || e
      });
    } finally {
      await poolDb.endPoolConnection();
    }
  });
