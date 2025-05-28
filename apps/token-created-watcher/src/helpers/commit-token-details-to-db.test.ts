import {
  commitTokenDetailsToDb,
  type CommitTokenDetailsToDbResult
} from './commit-token-details-to-db.js';
import * as dbModule from '@wiretap/db';
import {
  accountEntities,
  currencies,
  type Pool,
  type Token
} from '@wiretap/db';
import type { Address } from 'viem';
import { env } from '../env.js';
import type { TokenCreatedOnChainParams } from '../types/token-created.js';
import { CLANKER_3_1_UNISWAP_FEE_BPS } from '@wiretap/config';
import { expect } from 'vitest';
import type { PoolContext } from './get-pool-context.js';

const spyEndPoolConnection = vi.spyOn(
  dbModule.PooledDbConnection.prototype,
  'endPoolConnection'
);

const BLOCK_NUMBER = 1234567890;
const BLOCK_TIMESTAMP = new Date('2025-01-01T00:00:00.000Z');

const DEPLOYER_CONTRACT_ADDRESS =
  '0x9999999999999999999999999999999999999999' as Address;

const JOHNY_PRIMARY_ETH_WALLET =
  '0x1111111111111111111111111111111111111111' as Address;

const poolContext: PoolContext = {
  address: '0x8888888888888888888888888888888888888888' as Address,
  pairedAddress: '0x8888888888888888888888888888888888888888' as Address,
  token0IsNewToken: true,
  priceEth: 100.0,
  priceUsd: 100.0
};

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
  },
  totalSupply: 100_000_000_000,
  poolContext
};

const testAccountEntityLabel = 'Test Entity';
let testAccountEntityId: number;
let committedTokenDetailsResult: CommitTokenDetailsToDbResult;

describe('commitTokenDetailsToDb', () => {
  const db = dbModule.singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  describe('pool db connection', () => {
    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);

      await db.insert(currencies).values({
        address: testTokenCreatedData.poolContext.pairedAddress,
        name: testTokenCreatedData.tokenName,
        symbol: testTokenCreatedData.symbol,
        decimals: 18
      });

      const [testAccountEntity] = await db
        .insert(accountEntities)
        .values({
          label: testAccountEntityLabel
        })
        .returning();
      testAccountEntityId = testAccountEntity!.id;
      spyEndPoolConnection.mockClear();
    });

    it('should be closed on success', async () => {
      await expect(
        commitTokenDetailsToDb({
          tokenCreatedData: testTokenCreatedData,
          accountEntityId: testAccountEntityId,
          tokenScore: null
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
          accountEntityId: testAccountEntityId,
          tokenScore: null
        })
      ).rejects.toThrowError('Cannot read properties of null');
      expect(spyEndPoolConnection).toHaveBeenCalledTimes(1);
    });
  });

  describe('function returns db objects', () => {
    beforeAll(async () => {
      await dbModule.unsafe__clearDbTables(db);
      await db.insert(currencies).values({
        address: testTokenCreatedData.poolContext.pairedAddress,
        name: testTokenCreatedData.tokenName,
        symbol: testTokenCreatedData.symbol,
        decimals: 18
      });
      const [testAccountEntity] = await db
        .insert(accountEntities)
        .values({
          label: testAccountEntityLabel
        })
        .returning();
      testAccountEntityId = testAccountEntity!.id;
    });

    it('should return created DB objects', async () => {
      const result = await commitTokenDetailsToDb({
        tokenCreatedData: testTokenCreatedData,
        accountEntityId: testAccountEntityId,
        tokenScore: null
      });

      expect(result).toStrictEqual({
        block: {
          number: BLOCK_NUMBER,
          timestamp: BLOCK_TIMESTAMP
        },
        token: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          name: testTokenCreatedData.tokenName,
          symbol: testTokenCreatedData.symbol,
          address: testTokenCreatedData.tokenAddress,
          deploymentTransactionHash: testTokenCreatedData.transactionHash,
          block: BLOCK_NUMBER,
          deploymentContractId: result.deployerContract.id,
          accountEntityId: testAccountEntityId,
          score: null,
          imageUrl: null,
          totalSupply: testTokenCreatedData.totalSupply,
          creatorTokenIndex: 0
        } as Token,
        tokenPool: {
          address: testTokenCreatedData.poolContext.pairedAddress,
          athMcapUsd: 10000000000000,
          createdAt: expect.any(Date),
          currencyId: expect.any(Number),
          feeBps: CLANKER_3_1_UNISWAP_FEE_BPS,
          id: expect.any(Number),
          isPrimary: true,
          startingMcapUsd: 10000000000000,
          tokenId: result.token.id,
          updatedAt: null
        } as Pool,
        deployerContract: {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          address: testTokenCreatedData.deployerContractAddress
        }
      });
    });
  });

  describe('function creates db rows', () => {
    beforeAll(async () => {
      await dbModule.unsafe__clearDbTables(db);
      await db.insert(currencies).values({
        address: testTokenCreatedData.poolContext.pairedAddress,
        name: testTokenCreatedData.tokenName,
        symbol: testTokenCreatedData.symbol,
        decimals: 18
      });
      const [testAccountEntity] = await db
        .insert(accountEntities)
        .values({
          label: testAccountEntityLabel
        })
        .returning();
      testAccountEntityId = testAccountEntity!.id;

      committedTokenDetailsResult = await commitTokenDetailsToDb({
        tokenCreatedData: testTokenCreatedData,
        accountEntityId: testAccountEntityId,
        tokenScore: null
      });
    });

    it('should create new token in DB', async () => {
      const token = await dbModule.getTokenByAddress(
        db,
        committedTokenDetailsResult.token.address
      );
      expect(token).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        name: testTokenCreatedData.tokenName,
        symbol: testTokenCreatedData.symbol,
        address: testTokenCreatedData.tokenAddress,
        deploymentTransactionHash: testTokenCreatedData.transactionHash,
        block: BLOCK_NUMBER,
        deploymentContractId: committedTokenDetailsResult.deployerContract.id,
        accountEntityId: testAccountEntityId,
        score: null,
        imageUrl: null,
        totalSupply: testTokenCreatedData.totalSupply,
        creatorTokenIndex: 0
      } as Token);
    });

    it('should create new deployerContract in DB', async () => {
      const deployerContract = await dbModule.getDeployerContract(
        db,
        committedTokenDetailsResult.deployerContract.address
      );

      expect(deployerContract).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        address: testTokenCreatedData.deployerContractAddress
      });
    });

    it('should create new block in DB', async () => {
      const block = await dbModule.getBlockByNumber(
        db,
        committedTokenDetailsResult.block.number
      );

      expect(block).toStrictEqual({
        ...committedTokenDetailsResult.block,
        createdAt: expect.any(Date)
      });
    });

    it('should create new pool in DB', async () => {
      const getPoolResult = await dbModule.getPool(
        db,
        committedTokenDetailsResult.tokenPool.address as Address
      );
      const pool = getPoolResult?.pools;

      expect(pool).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        address: poolContext.address,
        athMcapUsd: expect.any(Number),
        currencyId: expect.any(Number),
        feeBps: CLANKER_3_1_UNISWAP_FEE_BPS,
        startingMcapUsd: expect.any(Number),
        tokenId: committedTokenDetailsResult.token.id,
        updatedAt: null,
        isPrimary: expect.any(Boolean)
      });
    });
  });
});
