import { privateProcedure } from '@/server/api/trpc';
import {
  AccountEntityTracker,
  getAccountEntity,
  GetAccountEntityResult,
  getAccountEntityTrackersForWireTapAccount
} from '@wiretap/db';
import { Basename, getBasename } from '@wiretap/utils/shared';
import { Address } from 'viem';

export interface AuthedAccountTarget extends GetAccountEntityResult {
  tracker: AccountEntityTracker;
  basename?: Basename;
}

export const getAuthedAccountTargets = privateProcedure.query(
  async ({ ctx }): Promise<AuthedAccountTarget[]> => {
    const { db, viemClient, wireTapAccountId } = ctx;

    // TODO: replace getAccountEntityTrackersForWireTapAccount + the batched getAccountEntity with a single SQL query

    const authedAccountTargets =
      await getAccountEntityTrackersForWireTapAccount(db, wireTapAccountId);

    const fullTargets: AuthedAccountTarget[] = (
      await Promise.all(
        authedAccountTargets.map(async (tracker) => {
          const accountEntityInfo = await getAccountEntity(
            db,
            tracker.trackedAccountEntityId
          );
          if (!accountEntityInfo) {
            // Note: should never happen
            console.error('tracked account does not have account entity');
            return null;
          }
          const needsBasename =
            accountEntityInfo.farcasterAccounts.length === 0;
          const address: Address | undefined =
            (accountEntityInfo.wallets[0]?.address as Address) ?? undefined;
          let basename: Basename | undefined;
          if (needsBasename && address) {
            try {
              basename = await getBasename(viemClient, address);
            } catch (error) {
              console.error(
                '"getAuthedAccountTargets: error getting basename',
                error
              );
            }
          }
          return {
            tracker,
            ...accountEntityInfo,
            basename
          };
        })
      )
    ).filter((target) => target !== null);

    return fullTargets;
  }
);
