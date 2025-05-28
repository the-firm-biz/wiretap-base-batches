// import { TokenIndexerError } from '../errors.js';

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
