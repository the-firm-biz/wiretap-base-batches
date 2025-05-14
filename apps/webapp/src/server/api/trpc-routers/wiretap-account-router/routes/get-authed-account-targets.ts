import { privateProcedure } from '@/server/api/trpc';
import {
  AccountEntityTracker,
  getAccountEntity,
  GetAccountEntityResult,
  getAccountEntityTrackersForWireTapAccount
} from '@wiretap/db';

export interface AuthedAccountTarget extends GetAccountEntityResult {
  tracker: AccountEntityTracker;
}

export const getAuthedAccountTargets = privateProcedure.query(
  async ({ ctx }): Promise<AuthedAccountTarget[]> => {
    const { db, wireTapAccountId } = ctx;

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
          return {
            tracker,
            ...accountEntityInfo
          };
        })
      )
    ).filter((target) => target !== null);

    return fullTargets;
  }
);
