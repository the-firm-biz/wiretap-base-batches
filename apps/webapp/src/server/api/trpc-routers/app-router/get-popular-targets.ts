import { fetchBulkUsers } from '@wiretap/utils/server';
import { publicProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { SearchTarget } from '@/app/utils/target/types';

// Top FIDs from https://dune.com/queries/3023113/5022265
const popularFids = [
  3, 239, 99, 12, 557, 129, 282172, 269694, 517425, 15983, 4407, 2, 2802,
  430312, 3621, 758919, 243300, 680, 644583, 5774, 780900, 535036, 882335,
  897299, 988167, 606589, 234616, 3642, 439610, 459385, 5818, 12142, 861754,
  13874, 4167, 892889, 537378, 3635, 1356, 357897, 472680, 993011, 247143,
  190218, 444773, 1020, 638859, 988281, 2210, 864405, 722082, 169, 8, 511131,
  347, 1015455, 473, 500861, 20919, 4973, 1287, 17571, 1007759, 456627, 15549,
  214447, 281836, 507986, 617, 9933, 3895, 7251, 460666, 340986, 539, 412843,
  403020, 15351, 395346, 739943, 5650, 1407, 1049588, 955273, 426, 7143, 616,
  842363, 4085, 193826, 1074590, 4895, 20384, 409857, 12921, 281676, 1606, 8447,
  861854, 548932
];

const top15Fids = popularFids.slice(0, 15);

export const getPopularTargets = publicProcedure.query(
  async ({ ctx }): Promise<SearchTarget[]> => {
    const { neynarClient } = ctx;

    const users = await fetchBulkUsers(neynarClient, top15Fids);

    // We don't want to cache the empty array as we're sure there should be users, thus throwing 500
    if (!users) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'INTERNAL_SERVER_ERROR'
      });
    }

    return users.map((user) => ({
      neynarUser: user,
      isTracked: false
    }));
  }
);
