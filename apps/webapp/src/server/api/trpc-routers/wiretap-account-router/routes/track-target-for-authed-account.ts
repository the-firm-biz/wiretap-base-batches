import { z } from 'zod';
import { privateProcedure } from '@/server/api/trpc';
import {
  AccountEntityTracker,
  createAccountEntity,
  createAccountEntityTracker,
  PooledDbConnection
} from '@wiretap/db';
import { neynarUserSchema } from '@wiretap/utils/server';
import { Address, isAddressEqual } from 'viem';
import { serverEnv } from '@/serverEnv';
import { getExistingAccountInfo } from '../helpers/getExistingAccountInfo';
import { TRPCError } from '@trpc/server';

const trackSchema = z.object({
  evmAddress: z.string(), // TODO: can this be optional?
  neynarUser: neynarUserSchema.optional()
});

// TODO: DO NOT USE NUMBER
const DEFAULT_MAX_SPEND_WEI = 10000000000000000; // 0.01 ETH

/**
 * TODO: This file contains some copy-pasta from @wiretap/token-created-watcher's commit-account-info-to-db.ts
 * DRY this up
 */

export const trackTargetForAuthedAccount = privateProcedure
  .input(trackSchema)
  .mutation(async ({ ctx, input }): Promise<AccountEntityTracker | null> => {
    const { db, wireTapAccountId } = ctx;

    const { evmAddress, neynarUser } = input;

    try {
      const { accountEntityId: existingAccountEntityId } =
        await getExistingAccountInfo(db, evmAddress as Address, neynarUser);

      if (existingAccountEntityId) {
        const createdTracker = await createAccountEntityTracker(db, {
          trackerWireTapAccountId: wireTapAccountId,
          trackedAccountEntityId: existingAccountEntityId,
          maxSpend: DEFAULT_MAX_SPEND_WEI
        });
        return createdTracker;
      }

      // User wants to track a target that is not in DB yet
      const neynarEthWallets =
        neynarUser?.verified_addresses.eth_addresses ?? [];
      const allWallets = neynarEthWallets.reduce<Address[]>(
        (acc, cur) => {
          if (!acc.some((w) => isAddressEqual(w, cur as Address))) {
            acc.push(cur as Address);
          }
          return acc;
        },
        [evmAddress as Address]
      );

      const neynarXAccounts = neynarUser
        ? neynarUser.verified_accounts
            .filter(({ platform }) => platform === 'x')
            .map(({ username }) => username)
            .filter((username) => username !== undefined && username !== null) // to satisfy typescript
        : [];

      const pooledDb = new PooledDbConnection({
        databaseUrl: serverEnv.DATABASE_URL
      });

      const createdTracker = await pooledDb.db.transaction(async (tx) => {
        const { accountEntity } = await createAccountEntity(tx, {
          newWallets: allWallets.map((wallet) => ({
            address: wallet
          })),
          newXAccounts: neynarXAccounts.map((username) => ({
            xid: `xid-for-${username}`, // TODO: actually get xid
            username
          })),
          newFarcasterAccount: neynarUser
            ? {
                fid: neynarUser.fid,
                username: neynarUser.username,
                displayName: neynarUser.display_name,
                pfpUrl: neynarUser.pfp_url,
                followerCount: neynarUser.follower_count
              }
            : undefined
        });

        return await createAccountEntityTracker(tx, {
          trackerWireTapAccountId: wireTapAccountId,
          trackedAccountEntityId: accountEntity.id,
          maxSpend: DEFAULT_MAX_SPEND_WEI
        });
      });
      return createdTracker;
    } catch (e: any) {
      console.error('trackTargetForAuthedAccount', e);
      const alreadyTracking = e.message?.includes(
        'account_entity_trackers_tracker_wire_tap_account_id_tracked_acc'
      );
      if (alreadyTracking) {
        throw new TRPCError({
          code: e.code || 'INTERNAL_SERVER_ERROR',
          message: 'Already tracking'
        });
      }
      throw new TRPCError({
        code: e.code || 'INTERNAL_SERVER_ERROR',
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
  });
