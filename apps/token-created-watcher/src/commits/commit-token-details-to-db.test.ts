import {
  commitTokenDetailsToDb,
  type CommitTokenDetailsToDbResult
} from './commit-token-details-to-db.js';
import * as dbModule from '@wiretap/db';
import type { Address } from 'viem';
import { env } from '../env.js';
import type { TokenCreatedOnChainParams } from '../types/token-created.js';
import type { NeynarUser } from '@wiretap/utils/server';
import type {
  FarcasterAccount,
  GetAccountEntityResult,
  Wallet,
  XAccount
} from '@wiretap/db';
import { TokenIndexerError } from '../errors.js';

const spyEndPoolConnection = vi.spyOn(
  dbModule.PooledDbConnection.prototype,
  'endPoolConnection'
);

const JOHNY_PRIMARY_ETH_WALLET =
  '0x1111111111111111111111111111111111111111' as Address;
const JOHNY_SECONDARY_ETH_WALLET =
  '0x2222222222222222222222222222222222222222' as Address;
const JOHNY_TERTIARY_ETH_WALLET =
  '0x3333333333333333333333333333333333333333' as Address;
const JOHNY_SECRET_ETH_WALLET =
  '0x4444444444444444444444444444444444444444' as Address;

const BLOCK_NUMBER = 1234567890;
const BLOCK_TIMESTAMP = new Date('2025-01-01T00:00:00.000Z');

const DEPLOYER_CONTRACT_ADDRESS =
  '0x9999999999999999999999999999999999999999' as Address;

const testTokenCreatedData: TokenCreatedOnChainParams = {
  transactionHash:
    '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc' as `0x${string}`,
  tokenAddress: '0x8888888888888888888888888888888888888888' as Address,
  symbol: 'TST',
  tokenName: 'Test Token',
  deployerContractAddress: DEPLOYER_CONTRACT_ADDRESS,
  msgSender: JOHNY_PRIMARY_ETH_WALLET,
  block: {
    number: BLOCK_NUMBER,
    timestamp: BLOCK_TIMESTAMP
  }
};

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

describe('commitTokenDetailsToDb', () => {
  const db = dbModule.singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  describe('pool db connection', () => {
    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);
      spyEndPoolConnection.mockClear();
    });

    it('should be closed on success', async () => {
      await expect(
        commitTokenDetailsToDb({
          tokenCreatedData: testTokenCreatedData,
          tokenCreatorAddress: testTokenCreatedData.msgSender
        })
      ).resolves.not.toThrow();
      expect(spyEndPoolConnection).toHaveBeenCalledTimes(1);
    });

    it('should be closed on error', async () => {
      await expect(
        commitTokenDetailsToDb({
          tokenCreatedData: {
            ...testTokenCreatedData,
            deployerContractAddress: null as unknown as Address // trigger random error
          },
          tokenCreatorAddress: testTokenCreatedData.msgSender
        })
      ).rejects.toThrowError('Cannot read properties of null');
      expect(spyEndPoolConnection).toHaveBeenCalledTimes(1);
    });
  });

  describe('new token creator, no neynar user', () => {
    let result: CommitTokenDetailsToDbResult;
    let accountEntityDbRows: GetAccountEntityResult | undefined;

    beforeAll(async () => {
      await dbModule.unsafe__clearDbTables(db);
      result = await commitTokenDetailsToDb({
        tokenCreatedData: testTokenCreatedData,
        tokenCreatorAddress: testTokenCreatedData.msgSender
      });
      accountEntityDbRows = await dbModule.getAccountEntity(
        db,
        result.accountEntityId
      );
    });

    it('should return created DB objects', () => {
      expect(result.wallets.length).toBe(1);
      expect(result).toStrictEqual({
        block: {
          number: BLOCK_NUMBER,
          timestamp: BLOCK_TIMESTAMP
        },
        accountEntityId: expect.any(Number),
        token: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          name: testTokenCreatedData.tokenName,
          symbol: testTokenCreatedData.symbol,
          address: testTokenCreatedData.tokenAddress,
          deploymentTransactionHash: testTokenCreatedData.transactionHash,
          block: BLOCK_NUMBER,
          deploymentContractId: result.deployerContract.id,
          accountEntityId: result.accountEntityId
        },
        deployerContract: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          address: testTokenCreatedData.deployerContractAddress
        },
        wallets: expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: testTokenCreatedData.msgSender,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          }
        ]),
        farcasterAccounts: [],
        xAccounts: []
      });
    });

    it('should create new account in DB', () => {
      expect(accountEntityDbRows).toBeDefined();
      expect(accountEntityDbRows?.accountEntity).toStrictEqual({
        id: result.accountEntityId,
        createdAt: expect.any(Date),
        label: null
      });
    });

    it('should create new wallet in DB', () => {
      expect(accountEntityDbRows?.wallets.length).toBe(1);
      expect(accountEntityDbRows?.wallets[0]).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        address: testTokenCreatedData.msgSender,
        verificationSourceId: null,
        accountEntityId: result.accountEntityId
      });
    });

    it('should NOT create new farcaster account in DB', () => {
      expect(accountEntityDbRows?.farcasterAccounts.length).toBe(0);
    });

    it('should NOT create new x account in DB', () => {
      expect(accountEntityDbRows?.xAccounts.length).toBe(0);
    });

    it('should create new token in DB', () => {
      expect(accountEntityDbRows?.tokens.length).toBe(1);
      expect(accountEntityDbRows?.tokens[0]).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        name: testTokenCreatedData.tokenName,
        symbol: testTokenCreatedData.symbol,
        address: testTokenCreatedData.tokenAddress,
        deploymentTransactionHash: testTokenCreatedData.transactionHash,
        block: BLOCK_NUMBER,
        deploymentContractId: result.deployerContract.id,
        accountEntityId: result.accountEntityId
      });
    });
  });

  describe('new token creator, new neynar user', () => {
    let result: CommitTokenDetailsToDbResult;
    let accountEntityDbRows: GetAccountEntityResult | undefined;

    beforeAll(async () => {
      await dbModule.unsafe__clearDbTables(db);
      result = await commitTokenDetailsToDb({
        tokenCreatedData: testTokenCreatedData,
        tokenCreatorAddress: testTokenCreatedData.msgSender,
        neynarUser: testNeynarUser
      });
      accountEntityDbRows = await dbModule.getAccountEntity(
        db,
        result.accountEntityId
      );
    });

    it('should return created DB objects', () => {
      expect(result.wallets.length).toBe(3);
      expect(result).toStrictEqual({
        block: {
          number: BLOCK_NUMBER,
          timestamp: BLOCK_TIMESTAMP
        },
        accountEntityId: expect.any(Number),
        token: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          name: testTokenCreatedData.tokenName,
          symbol: testTokenCreatedData.symbol,
          address: testTokenCreatedData.tokenAddress,
          deploymentTransactionHash: testTokenCreatedData.transactionHash,
          block: BLOCK_NUMBER,
          deploymentContractId: result.deployerContract.id,
          accountEntityId: result.accountEntityId
        },
        deployerContract: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          address: testTokenCreatedData.deployerContractAddress
        },
        wallets: expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: testTokenCreatedData.msgSender,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          }
        ]),
        farcasterAccounts: expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            fid: testNeynarUser.fid,
            username: testNeynarUser.username,
            accountEntityId: result.accountEntityId
          }
        ]),
        xAccounts: expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
            username: JOHNY_FIRST_X_ACCOUNT,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`,
            username: JOHNY_SECOND_X_ACCOUNT,
            accountEntityId: result.accountEntityId
          }
        ])
      });
    });

    it('should create new account in DB', () => {
      expect(accountEntityDbRows).toBeDefined();
      expect(accountEntityDbRows?.accountEntity).toStrictEqual({
        id: result.accountEntityId,
        createdAt: expect.any(Date),
        label: null
      });
    });

    it('should create new wallets in DB', () => {
      expect(accountEntityDbRows?.wallets.length).toBe(3);
      expect(accountEntityDbRows?.wallets).toStrictEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_PRIMARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_SECONDARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_TERTIARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          }
        ])
      );
    });

    it('should create new farcaster account in DB', () => {
      expect(accountEntityDbRows?.farcasterAccounts.length).toBe(1);
      expect(accountEntityDbRows?.farcasterAccounts[0]).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        fid: testNeynarUser.fid,
        username: testNeynarUser.username,
        accountEntityId: result.accountEntityId
      });
    });

    it('should create new x accounts in DB', () => {
      expect(accountEntityDbRows?.xAccounts.length).toBe(2);
      expect(accountEntityDbRows?.xAccounts).toStrictEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
            username: JOHNY_FIRST_X_ACCOUNT,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`,
            username: JOHNY_SECOND_X_ACCOUNT,
            accountEntityId: result.accountEntityId
          }
        ])
      );
    });

    it('should create new token in DB', () => {
      expect(accountEntityDbRows?.tokens.length).toBe(1);
      expect(accountEntityDbRows?.tokens[0]).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        name: testTokenCreatedData.tokenName,
        symbol: testTokenCreatedData.symbol,
        address: testTokenCreatedData.tokenAddress,
        deploymentTransactionHash: testTokenCreatedData.transactionHash,
        block: BLOCK_NUMBER,
        deploymentContractId: result.deployerContract.id,
        accountEntityId: result.accountEntityId
      });
    });
  });

  describe('existing token creator, no neynar user', () => {
    let existingAccountEntityId: number;
    let existingWallet: Wallet;
    let result: CommitTokenDetailsToDbResult;
    let accountEntityDbRows: GetAccountEntityResult | undefined;

    beforeAll(async () => {
      await dbModule.unsafe__clearDbTables(db);
      const dbPool = new dbModule.PooledDbConnection({
        databaseUrl: env.DATABASE_URL
      });
      const { accountEntity, wallets } = await dbModule.createAccountEntity(
        dbPool.db,
        {
          newWallets: [
            {
              address: JOHNY_PRIMARY_ETH_WALLET
            }
          ]
        }
      );
      existingAccountEntityId = accountEntity.id;
      existingWallet = wallets[0] as Wallet;
      await dbPool.endPoolConnection();
      result = await commitTokenDetailsToDb({
        tokenCreatedData: testTokenCreatedData,
        tokenCreatorAddress: testTokenCreatedData.msgSender
      });
      accountEntityDbRows = await dbModule.getAccountEntity(
        db,
        result.accountEntityId
      );
    });

    it('should return DB objects (existing and created) related to existing account entity', () => {
      expect(result.wallets.length).toBe(1);
      expect(result).toStrictEqual({
        block: {
          number: BLOCK_NUMBER,
          timestamp: BLOCK_TIMESTAMP
        },
        accountEntityId: expect.any(Number),
        token: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          name: testTokenCreatedData.tokenName,
          symbol: testTokenCreatedData.symbol,
          address: testTokenCreatedData.tokenAddress,
          deploymentTransactionHash: testTokenCreatedData.transactionHash,
          block: BLOCK_NUMBER,
          deploymentContractId: result.deployerContract.id,
          accountEntityId: result.accountEntityId
        },
        deployerContract: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          address: testTokenCreatedData.deployerContractAddress
        },
        wallets: expect.arrayContaining([existingWallet]),
        farcasterAccounts: [],
        xAccounts: []
      });
    });

    it('should NOT create new account in DB', () => {
      expect(accountEntityDbRows?.accountEntity.id).toBe(
        existingAccountEntityId
      );
    });

    it('should NOT create new wallet in DB', () => {
      expect(accountEntityDbRows?.wallets.length).toBe(1);
      expect(accountEntityDbRows?.wallets[0]).toStrictEqual(existingWallet);
    });

    it('should NOT create new farcaster account in DB', () => {
      expect(accountEntityDbRows?.farcasterAccounts.length).toBe(0);
    });

    it('should NOT create new x account in DB', () => {
      expect(accountEntityDbRows?.xAccounts.length).toBe(0);
    });

    it('should create new token in DB', () => {
      expect(accountEntityDbRows?.tokens.length).toBe(1);
      expect(accountEntityDbRows?.tokens[0]).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        name: testTokenCreatedData.tokenName,
        symbol: testTokenCreatedData.symbol,
        address: testTokenCreatedData.tokenAddress,
        deploymentTransactionHash: testTokenCreatedData.transactionHash,
        block: BLOCK_NUMBER,
        deploymentContractId: result.deployerContract.id,
        accountEntityId: existingAccountEntityId
      });
    });
  });

  describe('existing token creator, new neynar user', () => {
    let existingAccountEntityId: number;
    let existingWallet: Wallet;
    let result: CommitTokenDetailsToDbResult;
    let accountEntityDbRows: GetAccountEntityResult | undefined;

    beforeAll(async () => {
      await dbModule.unsafe__clearDbTables(db);
      const dbPool = new dbModule.PooledDbConnection({
        databaseUrl: env.DATABASE_URL
      });
      const { accountEntity, wallets } = await dbModule.createAccountEntity(
        dbPool.db,
        {
          newWallets: [
            {
              address: JOHNY_PRIMARY_ETH_WALLET
            }
          ]
        }
      );
      existingAccountEntityId = accountEntity.id;
      existingWallet = wallets[0] as Wallet;
      await dbPool.endPoolConnection();
      result = await commitTokenDetailsToDb({
        tokenCreatedData: testTokenCreatedData,
        tokenCreatorAddress: testTokenCreatedData.msgSender,
        neynarUser: testNeynarUser
      });
      accountEntityDbRows = await dbModule.getAccountEntity(
        db,
        result.accountEntityId
      );
    });

    it('should return DB objects (existing and created) related to existing account entity', () => {
      expect(result.wallets.length).toBe(3);
      expect(result).toStrictEqual({
        block: {
          number: BLOCK_NUMBER,
          timestamp: BLOCK_TIMESTAMP
        },
        accountEntityId: expect.any(Number),
        token: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          name: testTokenCreatedData.tokenName,
          symbol: testTokenCreatedData.symbol,
          address: testTokenCreatedData.tokenAddress,
          deploymentTransactionHash: testTokenCreatedData.transactionHash,
          block: BLOCK_NUMBER,
          deploymentContractId: result.deployerContract.id,
          accountEntityId: result.accountEntityId
        },
        deployerContract: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          address: testTokenCreatedData.deployerContractAddress
        },
        wallets: expect.arrayContaining([
          existingWallet,
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_SECONDARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_TERTIARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          }
        ]),
        farcasterAccounts: expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            fid: testNeynarUser.fid,
            username: testNeynarUser.username,
            accountEntityId: result.accountEntityId
          }
        ]),
        xAccounts: expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
            username: JOHNY_FIRST_X_ACCOUNT,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`,
            username: JOHNY_SECOND_X_ACCOUNT,
            accountEntityId: result.accountEntityId
          }
        ])
      });
    });

    it('should NOT create new account in DB', () => {
      expect(accountEntityDbRows?.accountEntity.id).toBe(
        existingAccountEntityId
      );
    });

    it('should create only missing verified wallets in DB', () => {
      expect(accountEntityDbRows?.wallets.length).toBe(3);
      expect(accountEntityDbRows?.wallets).toStrictEqual(
        expect.arrayContaining([
          existingWallet,
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_SECONDARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_TERTIARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          }
        ])
      );
    });

    it('should create new farcaster account in DB', () => {
      expect(accountEntityDbRows?.farcasterAccounts.length).toBe(1);
      expect(accountEntityDbRows?.farcasterAccounts[0]).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        fid: testNeynarUser.fid,
        username: testNeynarUser.username,
        accountEntityId: existingAccountEntityId
      });
    });

    it('should create new x account in DB', () => {
      expect(accountEntityDbRows?.xAccounts.length).toBe(2);
      expect(accountEntityDbRows?.xAccounts).toStrictEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
            username: JOHNY_FIRST_X_ACCOUNT,
            accountEntityId: existingAccountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`,
            username: JOHNY_SECOND_X_ACCOUNT,
            accountEntityId: existingAccountEntityId
          }
        ])
      );
    });

    it('should create new token in DB', () => {
      expect(accountEntityDbRows?.tokens.length).toBe(1);
      expect(accountEntityDbRows?.tokens[0]).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        name: testTokenCreatedData.tokenName,
        symbol: testTokenCreatedData.symbol,
        address: testTokenCreatedData.tokenAddress,
        deploymentTransactionHash: testTokenCreatedData.transactionHash,
        block: BLOCK_NUMBER,
        deploymentContractId: result.deployerContract.id,
        accountEntityId: existingAccountEntityId
      });
    });
  });

  describe('new token creator, existing neynar user', () => {
    let existingAccountEntityId: number;
    let existingFarcasterAccount: FarcasterAccount;
    let result: CommitTokenDetailsToDbResult;
    let accountEntityDbRows: GetAccountEntityResult | undefined;

    beforeAll(async () => {
      await dbModule.unsafe__clearDbTables(db);
      const dbPool = new dbModule.PooledDbConnection({
        databaseUrl: env.DATABASE_URL
      });
      const { accountEntity, farcasterAccount } =
        await dbModule.createAccountEntity(dbPool.db, {
          newFarcasterAccount: {
            fid: testNeynarUser.fid,
            username: testNeynarUser.username
          },
          newXAccounts: [
            {
              xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
              username: JOHNY_FIRST_X_ACCOUNT
            }
          ]
        });
      existingAccountEntityId = accountEntity.id;
      existingFarcasterAccount = farcasterAccount as FarcasterAccount;
      await dbPool.endPoolConnection();
      result = await commitTokenDetailsToDb({
        tokenCreatedData: testTokenCreatedData,
        tokenCreatorAddress: testTokenCreatedData.msgSender,
        neynarUser: testNeynarUser
      });
      accountEntityDbRows = await dbModule.getAccountEntity(
        db,
        result.accountEntityId
      );
    });

    it('should return DB objects (existing and created) related to existing account entity', () => {
      expect(result.wallets.length).toBe(3);
      expect(result).toStrictEqual({
        block: {
          number: BLOCK_NUMBER,
          timestamp: BLOCK_TIMESTAMP
        },
        accountEntityId: expect.any(Number),
        token: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          name: testTokenCreatedData.tokenName,
          symbol: testTokenCreatedData.symbol,
          address: testTokenCreatedData.tokenAddress,
          deploymentTransactionHash: testTokenCreatedData.transactionHash,
          block: BLOCK_NUMBER,
          deploymentContractId: result.deployerContract.id,
          accountEntityId: result.accountEntityId
        },
        deployerContract: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          address: testTokenCreatedData.deployerContractAddress
        },
        wallets: expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_PRIMARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_SECONDARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_TERTIARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          }
        ]),
        farcasterAccounts: expect.arrayContaining([existingFarcasterAccount]),
        xAccounts: expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
            username: JOHNY_FIRST_X_ACCOUNT,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`,
            username: JOHNY_SECOND_X_ACCOUNT,
            accountEntityId: result.accountEntityId
          }
        ])
      });
    });

    it('should NOT create new account in DB', () => {
      expect(accountEntityDbRows?.accountEntity.id).toBe(
        existingAccountEntityId
      );
    });

    it('should create new wallets in DB (tokenCreatorAddress + neynar verified addresses)', () => {
      expect(accountEntityDbRows?.wallets.length).toBe(3);
      expect(accountEntityDbRows?.wallets).toStrictEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_PRIMARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: existingAccountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_SECONDARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: existingAccountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_TERTIARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: existingAccountEntityId
          }
        ])
      );
    });

    it('should NOT create new farcaster account in DB', () => {
      expect(accountEntityDbRows?.farcasterAccounts.length).toBe(1);
      expect(accountEntityDbRows?.farcasterAccounts[0]).toStrictEqual(
        existingFarcasterAccount
      );
    });

    it('should create missing x account in DB', () => {
      expect(accountEntityDbRows?.xAccounts.length).toBe(2);
      expect(accountEntityDbRows?.xAccounts).toStrictEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
            username: JOHNY_FIRST_X_ACCOUNT,
            accountEntityId: existingAccountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`,
            username: JOHNY_SECOND_X_ACCOUNT,
            accountEntityId: existingAccountEntityId
          }
        ])
      );
    });

    it('should create new token in DB', () => {
      expect(accountEntityDbRows?.tokens.length).toBe(1);
      expect(accountEntityDbRows?.tokens[0]).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        name: testTokenCreatedData.tokenName,
        symbol: testTokenCreatedData.symbol,
        address: testTokenCreatedData.tokenAddress,
        deploymentTransactionHash: testTokenCreatedData.transactionHash,
        block: BLOCK_NUMBER,
        deploymentContractId: result.deployerContract.id,
        accountEntityId: existingAccountEntityId
      });
    });
  });

  describe('existing token creator, existing neynar user', () => {
    let existingAccountEntityId: number;
    let existingWallet: Wallet;
    let existingFarcasterAccount: FarcasterAccount;
    let result: CommitTokenDetailsToDbResult;
    let accountEntityDbRows: GetAccountEntityResult | undefined;

    beforeAll(async () => {
      await dbModule.unsafe__clearDbTables(db);
      const dbPool = new dbModule.PooledDbConnection({
        databaseUrl: env.DATABASE_URL
      });
      const { accountEntity, wallets, farcasterAccount } =
        await dbModule.createAccountEntity(dbPool.db, {
          newWallets: [
            {
              address: JOHNY_PRIMARY_ETH_WALLET
            }
          ],
          newFarcasterAccount: {
            fid: testNeynarUser.fid,
            username: testNeynarUser.username
          },
          newXAccounts: [
            {
              xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
              username: JOHNY_FIRST_X_ACCOUNT
            }
          ]
        });
      existingAccountEntityId = accountEntity.id;
      existingFarcasterAccount = farcasterAccount as FarcasterAccount;
      existingWallet = wallets[0] as Wallet;
      await dbPool.endPoolConnection();
      result = await commitTokenDetailsToDb({
        tokenCreatedData: testTokenCreatedData,
        tokenCreatorAddress: testTokenCreatedData.msgSender,
        neynarUser: testNeynarUser
      });
      accountEntityDbRows = await dbModule.getAccountEntity(
        db,
        result.accountEntityId
      );
    });

    it('should return DB objects (existing and created) related to existing account entity', () => {
      expect(result.wallets.length).toBe(3);
      expect(result).toStrictEqual({
        block: {
          number: BLOCK_NUMBER,
          timestamp: BLOCK_TIMESTAMP
        },
        accountEntityId: expect.any(Number),
        token: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          name: testTokenCreatedData.tokenName,
          symbol: testTokenCreatedData.symbol,
          address: testTokenCreatedData.tokenAddress,
          deploymentTransactionHash: testTokenCreatedData.transactionHash,
          block: BLOCK_NUMBER,
          deploymentContractId: result.deployerContract.id,
          accountEntityId: result.accountEntityId
        },
        deployerContract: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          address: testTokenCreatedData.deployerContractAddress
        },
        wallets: expect.arrayContaining([
          existingWallet,
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_SECONDARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_TERTIARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: result.accountEntityId
          }
        ]),
        farcasterAccounts: expect.arrayContaining([existingFarcasterAccount]),
        xAccounts: expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
            username: JOHNY_FIRST_X_ACCOUNT,
            accountEntityId: result.accountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`,
            username: JOHNY_SECOND_X_ACCOUNT,
            accountEntityId: result.accountEntityId
          }
        ])
      });
    });

    it('should NOT create new account in DB', () => {
      expect(accountEntityDbRows?.accountEntity.id).toBe(
        existingAccountEntityId
      );
    });

    it('should only create missing verified wallets in DB', () => {
      expect(accountEntityDbRows?.wallets.length).toBe(3);
      expect(accountEntityDbRows?.wallets).toStrictEqual(
        expect.arrayContaining([
          existingWallet,
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_SECONDARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: existingAccountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_TERTIARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: existingAccountEntityId
          }
        ])
      );
    });

    it('should NOT create new farcaster account in DB', () => {
      expect(accountEntityDbRows?.farcasterAccounts.length).toBe(1);
      expect(accountEntityDbRows?.farcasterAccounts[0]).toStrictEqual(
        existingFarcasterAccount
      );
    });

    it('should create missing x account in DB', () => {
      expect(accountEntityDbRows?.xAccounts.length).toBe(2);
      expect(accountEntityDbRows?.xAccounts).toStrictEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`,
            username: JOHNY_FIRST_X_ACCOUNT,
            accountEntityId: existingAccountEntityId
          },
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`,
            username: JOHNY_SECOND_X_ACCOUNT,
            accountEntityId: existingAccountEntityId
          }
        ])
      );
    });

    it('should create new token in DB', () => {
      expect(accountEntityDbRows?.tokens.length).toBe(1);
      expect(accountEntityDbRows?.tokens[0]).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        name: testTokenCreatedData.tokenName,
        symbol: testTokenCreatedData.symbol,
        address: testTokenCreatedData.tokenAddress,
        deploymentTransactionHash: testTokenCreatedData.transactionHash,
        block: BLOCK_NUMBER,
        deploymentContractId: result.deployerContract.id,
        accountEntityId: existingAccountEntityId
      });
    });
  });

  describe('new neynar user for existing entity with farcaster account', () => {
    let existingAccountEntityId: number;
    let existingWallets: Wallet[];
    let existingXAccounts: XAccount[];
    let existingFarcasterAccount: FarcasterAccount;
    let result: CommitTokenDetailsToDbResult;
    let accountEntityDbRows: GetAccountEntityResult | undefined;

    beforeAll(async () => {
      await dbModule.unsafe__clearDbTables(db);
      // In this setup we find assicoation between JOHNY_SECONDARY_ETH_WALLET that we already have in DB
      // and same JOHNY_SECONDARY_ETH_WALLET being present in anotherNeynarUser verified wallets list
      const dbPool = new dbModule.PooledDbConnection({
        databaseUrl: env.DATABASE_URL
      });
      const { accountEntity, wallets, xAccounts, farcasterAccount } =
        await dbModule.createAccountEntity(dbPool.db, {
          newWallets: [
            {
              address: JOHNY_PRIMARY_ETH_WALLET
            },
            {
              address: JOHNY_SECONDARY_ETH_WALLET
            },
            {
              address: JOHNY_TERTIARY_ETH_WALLET
            }
          ],
          newFarcasterAccount: {
            fid: testNeynarUser.fid,
            username: testNeynarUser.username
          },
          newXAccounts: [
            {
              username: JOHNY_FIRST_X_ACCOUNT,
              xid: `xid-for-${JOHNY_FIRST_X_ACCOUNT}`
            },
            {
              username: JOHNY_SECOND_X_ACCOUNT,
              xid: `xid-for-${JOHNY_SECOND_X_ACCOUNT}`
            }
          ]
        });
      existingAccountEntityId = accountEntity.id;
      existingFarcasterAccount = farcasterAccount as FarcasterAccount;
      existingWallets = wallets;
      existingXAccounts = xAccounts;
      await dbPool.endPoolConnection();
      result = await commitTokenDetailsToDb({
        tokenCreatedData: {
          ...testTokenCreatedData,
          msgSender: JOHNY_SECRET_ETH_WALLET
        },
        tokenCreatorAddress: JOHNY_SECRET_ETH_WALLET,
        neynarUser: anotherNeynarUser
      });
      accountEntityDbRows = await dbModule.getAccountEntity(
        db,
        result.accountEntityId
      );
    });

    it('should create new farcaster account in DB', () => {
      expect(accountEntityDbRows?.farcasterAccounts.length).toBe(2);
      expect(accountEntityDbRows?.farcasterAccounts).toStrictEqual(
        expect.arrayContaining([
          existingFarcasterAccount,
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            fid: anotherNeynarUser.fid,
            username: anotherNeynarUser.username,
            accountEntityId: existingAccountEntityId
          }
        ])
      );
    });

    it('should add new neynar user verified wallet to DB', () => {
      expect(accountEntityDbRows?.wallets.length).toBe(4);
      expect(accountEntityDbRows?.wallets).toStrictEqual(
        expect.arrayContaining([
          ...existingWallets,
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            address: JOHNY_SECONDARY_ETH_WALLET,
            verificationSourceId: null,
            accountEntityId: existingAccountEntityId
          }
        ])
      );
    });

    it('should add new neynar user verified X accounts to DB', () => {
      expect(accountEntityDbRows?.xAccounts.length).toBe(3);
      expect(accountEntityDbRows?.xAccounts).toStrictEqual(
        expect.arrayContaining([
          ...existingXAccounts,
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            xid: `xid-for-${JOHNY_SECFRET_X_ACCOUNT}`,
            username: JOHNY_SECFRET_X_ACCOUNT,
            accountEntityId: existingAccountEntityId
          }
        ])
      );
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);
    });

    it('throws TokenIndexerError when there are conflicting accountEntityIds', async () => {
      const dbPool = new dbModule.PooledDbConnection({
        databaseUrl: env.DATABASE_URL
      });
      await dbModule.createAccountEntity(dbPool.db, {
        newWallets: [
          {
            address: JOHNY_PRIMARY_ETH_WALLET
          }
        ]
      });
      await dbModule.createAccountEntity(dbPool.db, {
        newFarcasterAccount: {
          fid: testNeynarUser.fid,
          username: testNeynarUser.username
        }
      });
      await dbPool.endPoolConnection();
      try {
        await commitTokenDetailsToDb({
          tokenCreatedData: testTokenCreatedData,
          tokenCreatorAddress: testTokenCreatedData.msgSender,
          neynarUser: testNeynarUser
        });
        throw new Error('expected to throw but did not');
      } catch (error) {
        expect(error).toBeInstanceOf(TokenIndexerError);
        if (error instanceof TokenIndexerError) {
          expect(error.message).toBe('conflicting accountEntityIds detected');
          expect(error.details).toStrictEqual({
            wallets: expect.any(Array),
            xAccounts: expect.any(Array),
            farcasterAccount: expect.any(Object)
          });
        } else {
          throw new Error('thrown error is not a TokenIndexerError');
        }
      }
    });

    it('does not create DB rows if transaction fails', async () => {
      const dbPool = new dbModule.PooledDbConnection({
        databaseUrl: env.DATABASE_URL
      });
      await dbModule.createAccountEntity(dbPool.db, {
        newWallets: [
          {
            address: JOHNY_PRIMARY_ETH_WALLET
          }
        ]
      });
      await dbModule.createAccountEntity(dbPool.db, {
        newFarcasterAccount: {
          fid: testNeynarUser.fid,
          username: testNeynarUser.username
        }
      });
      await dbPool.endPoolConnection();
      await expect(
        commitTokenDetailsToDb({
          tokenCreatedData: testTokenCreatedData,
          tokenCreatorAddress: testTokenCreatedData.msgSender,
          neynarUser: testNeynarUser
        })
      ).rejects.toThrow(TokenIndexerError);

      // getOrCreateDeployerContract is called before TokenIndexerError is thrown, we expect it to do nothing since tx failed
      const contractInDb = await dbModule.getDeployerContract(
        db,
        DEPLOYER_CONTRACT_ADDRESS
      );
      expect(contractInDb).toBeUndefined();
    });
  });
});
