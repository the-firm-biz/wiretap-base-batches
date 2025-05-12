import { privateProcedure } from '@/server/api/trpc';
import {
  AccountEntityTracker,
  getAccountEntityTrackersForWireTapAccount
} from '@wiretap/db';

export const getTargetsForAuthedAccount = privateProcedure.query(
  // @todo we will ultimately return a 'Target' type which also includes target metadata for the UI
  async ({ ctx }): Promise<AccountEntityTracker[] | null> => {
    const { db, wireTapAccountId } = ctx;

    // @todo targets - this will need to use a query which also resolves additional tables relating to the trackedAccountEntity,
    // the UI requires:
    // - wallet address
    // - name/label
    // - Farcaster username
    // - Farcaster pfp
    // - Farcaster follower count
    const authedAccountTargets =
      await getAccountEntityTrackersForWireTapAccount(db, wireTapAccountId);

    return authedAccountTargets || null;
  }
);
