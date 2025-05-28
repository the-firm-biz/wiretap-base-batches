// import { TokenIndexerError } from '../errors.js';

import type { NeynarUser } from '@wiretap/utils/server';
import type { Address } from 'viem';

const JOHNY_PRIMARY_ETH_WALLET =
  '0x1111111111111111111111111111111111111111' as Address;
const JOHNY_SECONDARY_ETH_WALLET =
  '0x2222222222222222222222222222222222222222' as Address;
const JOHNY_TERTIARY_ETH_WALLET =
  '0x3333333333333333333333333333333333333333' as Address;
const JOHNY_SECRET_ETH_WALLET =
  '0x4444444444444444444444444444444444444444' as Address;

const JOHNY_FIRST_X_ACCOUNT = 'johny_first_xaccount';
const JOHNY_SECOND_X_ACCOUNT = 'johny_second_xaccount';
const JOHNY_SECFRET_X_ACCOUNT = 'johny_secret_xaccount';

const testNeynarUser: NeynarUser = {
  fid: 11111,
  username: 'test_neynar_user',
  object: 'user',
  custody_address: '0x0000000000000000000000000000000000000000',
  profile: {
    bio: {
      text: 'Test Neynar User'
    }
  },
  follower_count: 100,
  following_count: 100,
  verifications: [],
  verified_addresses: {
    eth_addresses: [
      JOHNY_PRIMARY_ETH_WALLET,
      JOHNY_SECONDARY_ETH_WALLET,
      JOHNY_TERTIARY_ETH_WALLET
    ],
    sol_addresses: [],
    primary: {
      eth_address: JOHNY_PRIMARY_ETH_WALLET,
      sol_address: '0x0000000000000000000000000000000000000000'
    }
  },
  verified_accounts: [
    {
      platform: 'x',
      username: JOHNY_FIRST_X_ACCOUNT
    },
    {
      platform: 'x',
      username: JOHNY_SECOND_X_ACCOUNT
    },
    {
      platform: 'github',
      username: 'test_neynar_githubaccount'
    }
  ],
  power_badge: false
};

const anotherNeynarUser: NeynarUser = {
  ...testNeynarUser,
  fid: 22222,
  username: 'another_neynar_user',
  verified_addresses: {
    eth_addresses: [JOHNY_SECRET_ETH_WALLET, JOHNY_SECONDARY_ETH_WALLET],
    sol_addresses: [],
    primary: {
      eth_address: JOHNY_SECRET_ETH_WALLET,
      sol_address: '0x0000000000000000000000000000000000000000'
    }
  },
  verified_accounts: [
    {
      platform: 'x',
      username: JOHNY_SECFRET_X_ACCOUNT
    },
    {
      platform: 'github',
      username: 'johny_secret_githubaccount'
    }
  ]
};

// it('should return created DB objects', () => {
//     expect(result).toStrictEqual({
//       block: {
//         number: BLOCK_NUMBER,
//         timestamp: BLOCK_TIMESTAMP
//       },
//       accountEntityId: expect.any(Number),
//       token: {
//         id: expect.any(Number),
//         createdAt: expect.any(Date),
//         name: testTokenCreatedData.tokenName,
//         symbol: testTokenCreatedData.symbol,
//         address: testTokenCreatedData.tokenAddress,
//         deploymentTransactionHash: testTokenCreatedData.transactionHash,
//         block: BLOCK_NUMBER,
//         deploymentContractId: result.deployerContract.id,
//         accountEntityId: result.accountEntityId,
//         score: null,
//         totalSupply: testTokenCreatedData.totalSupply,
//         creatorTokenIndex: 0,
//         imageUrl: null
//       } as Token,
//       tokenPool: {
//         address: testTokenCreatedData.poolContext.pairedAddress,
//         athMcapUsd: 10000000000000,
//         createdAt: expect.any(Date),
//         currencyId: expect.any(Number),
//         feeBps: CLANKER_3_1_UNISWAP_FEE_BPS,
//         id: expect.any(Number),
//         isPrimary: true,
//         startingMcapUsd: 10000000000000,
//         tokenId: result.token.id,
//         updatedAt: null
//       } as Pool,
//       deployerContract: {
//         id: expect.any(Number),
//         createdAt: expect.any(Date),
//         address: testTokenCreatedData.deployerContractAddress
//       },
//       wallets: expect.arrayContaining([
//         {
//           id: expect.any(Number),
//           createdAt: expect.any(Date),
//           address: testTokenCreatedData.msgSender,
//           verificationSourceId: null,
//           accountEntityId: result.accountEntityId
//         }
//       ]),
//       farcasterAccounts: expect.arrayContaining([
//         {
//           id: expect.any(Number),
//           createdAt: expect.any(Date),
//           fid: testNeynarUser.fid,
//           username: testNeynarUser.username,
//           accountEntityId: result.accountEntityId,
//           displayName: null,
//           followerCount: testNeynarUser.follower_count,
//           pfpUrl: null
//         } as FarcasterAccount
//       ]),
//       xAccounts: expect.arrayContaining([
//         {
//           id: expect.any(Number),
//           createdAt: expect.any(Date),
//           xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
//           username: JOHNY_FIRST_X_ACCOUNT,
//           accountEntityId: result.accountEntityId
//         },
//         {
//           id: expect.any(Number),
//           createdAt: expect.any(Date),
//           xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`,
//           username: JOHNY_SECOND_X_ACCOUNT,
//           accountEntityId: result.accountEntityId
//         }
//       ])
//     });
//   });

//   it('should create new account in DB', () => {
//     expect(accountEntityDbRows).toBeDefined();
//     expect(accountEntityDbRows?.accountEntity).toStrictEqual({
//       id: result.accountEntityId,
//       createdAt: expect.any(Date),
//       label: null
//     });
//   });

//   it('should create new wallets in DB', () => {
//     expect(accountEntityDbRows?.wallets.length).toBe(3);
//     expect(accountEntityDbRows?.wallets).toStrictEqual(
//       expect.arrayContaining([
//         {
//           id: expect.any(Number),
//           createdAt: expect.any(Date),
//           address: JOHNY_PRIMARY_ETH_WALLET,
//           verificationSourceId: null,
//           accountEntityId: result.accountEntityId
//         },
//         {
//           id: expect.any(Number),
//           createdAt: expect.any(Date),
//           address: JOHNY_SECONDARY_ETH_WALLET,
//           verificationSourceId: null,
//           accountEntityId: result.accountEntityId
//         },
//         {
//           id: expect.any(Number),
//           createdAt: expect.any(Date),
//           address: JOHNY_TERTIARY_ETH_WALLET,
//           verificationSourceId: null,
//           accountEntityId: result.accountEntityId
//         }
//       ])
//     );
//   });

//   it('should create new farcaster account in DB', () => {
//     expect(accountEntityDbRows?.farcasterAccounts.length).toBe(1);
//     expect(accountEntityDbRows?.farcasterAccounts[0]).toStrictEqual({
//       id: expect.any(Number),
//       createdAt: expect.any(Date),
//       fid: testNeynarUser.fid,
//       username: testNeynarUser.username,
//       accountEntityId: result.accountEntityId,
//       displayName: null,
//       followerCount: 100,
//       pfpUrl: null
//     });
//   });

//   it('should create new x accounts in DB', () => {
//     expect(accountEntityDbRows?.xAccounts.length).toBe(2);
//     expect(accountEntityDbRows?.xAccounts).toStrictEqual(
//       expect.arrayContaining([
//         {
//           id: expect.any(Number),
//           createdAt: expect.any(Date),
//           xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
//           username: JOHNY_FIRST_X_ACCOUNT,
//           accountEntityId: result.accountEntityId
//         },
//         {
//           id: expect.any(Number),
//           createdAt: expect.any(Date),
//           xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`,
//           username: JOHNY_SECOND_X_ACCOUNT,
//           accountEntityId: result.accountEntityId
//         }
//       ])
//     );
//   });

//  it('should create new account in DB', () => {
//       expect(accountEntityDbRows).toBeDefined();
//       expect(accountEntityDbRows?.accountEntity).toStrictEqual({
//         id: result.accountEntityId,
//         createdAt: expect.any(Date),
//         label: null
//       });
//     });

//     it('should create new wallet in DB', () => {
//       expect(accountEntityDbRows?.wallets.length).toBe(1);
//       expect(accountEntityDbRows?.wallets[0]).toStrictEqual({
//         id: expect.any(Number),
//         createdAt: expect.any(Date),
//         address: testTokenCreatedData.msgSender,
//         verificationSourceId: null,
//         accountEntityId: result.accountEntityId
//       });
//     });

//     it('should NOT create new farcaster account in DB', () => {
//       expect(accountEntityDbRows?.farcasterAccounts.length).toBe(0);
//     });

//     it('should NOT create new x account in DB', () => {
//       expect(accountEntityDbRows?.xAccounts.length).toBe(0);
//     });

//     it('should create new token in DB', () => {
//       expect(accountEntityDbRows?.tokens.length).toBe(1);
//       expect(accountEntityDbRows?.tokens[0]).toStrictEqual({
//         id: expect.any(Number),
//         createdAt: expect.any(Date),
//         name: testTokenCreatedData.tokenName,
//         symbol: testTokenCreatedData.symbol,
//         address: testTokenCreatedData.tokenAddress,
//         deploymentTransactionHash: testTokenCreatedData.transactionHash,
//         block: BLOCK_NUMBER,
//         deploymentContractId: result.deployerContract.id,
//         accountEntityId: result.accountEntityId,
//         score: null,
//         imageUrl: null,
//         totalSupply: testTokenCreatedData.totalSupply,
//         creatorTokenIndex: 0
//       } as Token);
//     });
//   });

// describe('error handling', () => {
//     beforeEach(async () => {
//       await dbModule.unsafe__clearDbTables(db);
//     });

//     it('throws TokenIndexerError when there are conflicting accountEntityIds', async () => {
//       const dbPool = new dbModule.PooledDbConnection({
//         databaseUrl: env.DATABASE_URL
//       });
//       await dbModule.createAccountEntity(dbPool.db, {
//         newWallets: [
//           {
//             address: JOHNY_PRIMARY_ETH_WALLET
//           }
//         ]
//       });
//       await dbModule.createAccountEntity(dbPool.db, {
//         newFarcasterAccount: {
//           fid: testNeynarUser.fid,
//           username: testNeynarUser.username
//         }
//       });
//       await dbPool.endPoolConnection();
//       try {
//         await commitTokenDetailsToDb({
//           tokenCreatedData: testTokenCreatedData,
//           accountEntityId: testAccountEntityId,
//           tokenScore: null
//         });
//         throw new Error('expected to throw but did not');
//       } catch (error) {
//         expect(error).toBeInstanceOf(TokenIndexerError);
//         if (error instanceof TokenIndexerError) {
//           expect(error.message).toBe('conflicting accountEntityIds detected');
//           expect(error.details).toStrictEqual({
//             wallets: expect.any(Array),
//             xAccounts: expect.any(Array),
//             farcasterAccount: expect.any(Object)
//           });
//         } else {
//           throw new Error('thrown error is not a TokenIndexerError');
//         }
//       }
//     });

//     it('does not create DB rows if transaction fails', async () => {
//       const dbPool = new dbModule.PooledDbConnection({
//         databaseUrl: env.DATABASE_URL
//       });
//       await dbModule.createAccountEntity(dbPool.db, {
//         newWallets: [
//           {
//             address: JOHNY_PRIMARY_ETH_WALLET
//           }
//         ]
//       });
//       await dbModule.createAccountEntity(dbPool.db, {
//         newFarcasterAccount: {
//           fid: testNeynarUser.fid,
//           username: testNeynarUser.username
//         }
//       });
//       await dbPool.endPoolConnection();
//       await expect(
//         commitTokenDetailsToDb({
//           tokenCreatedData: testTokenCreatedData,
//           accountEntityId: testAccountEntityId,
//           tokenScore: null
//         })
//       ).rejects.toThrow(TokenIndexerError);

//       // getOrCreateDeployerContract is called before TokenIndexerError is thrown, we expect it to do nothing since tx failed
//       const contractInDb = await dbModule.getDeployerContract(
//         db,
//         DEPLOYER_CONTRACT_ADDRESS
//       );
//       expect(contractInDb).toBeUndefined();
//     });
//   });
