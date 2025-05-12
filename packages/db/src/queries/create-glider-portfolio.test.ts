import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { accountEntities, wireTapAccounts } from '../schema/accounts/index.js';
import {
  gliderPortfolios,
  type NewGliderPortfolio
} from '../schema/glider-portfolio.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { createGliderPortfolio } from './create-glider-portfolio.js';

describe('createGliderPortfolio ', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let newGliderPortfolio1: NewGliderPortfolio;
  let newGliderPortfolio2: NewGliderPortfolio;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity1, testAccountEntity2] = await db
      .insert(accountEntities)
      .values([{ label: 'Test Entity 1' }, { label: 'Test Entity 2' }])
      .returning();
    const [testWireTapAccount1, testWireTapAccount2] = await db
      .insert(wireTapAccounts)
      .values([
        { accountEntityId: testAccountEntity1!.id },
        { accountEntityId: testAccountEntity2!.id }
      ])
      .returning();
    newGliderPortfolio1 = {
      wireTapAccountId: testWireTapAccount1!.id,
      portfolioId: 'k12345',
      updatedAt: null,
      address: '0x1234567890123456789012345678901234567890'
    };
    newGliderPortfolio2 = {
      ...newGliderPortfolio1,
      wireTapAccountId: testWireTapAccount2!.id
    };
  });

  it('creates and returns Glider Portfolio', async () => {
    const response = await createGliderPortfolio(db, newGliderPortfolio1);
    const dbGliderPortfolios = await db.select().from(gliderPortfolios);
    expect(dbGliderPortfolios.length).toBe(1);
    expect(dbGliderPortfolios[0]!).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      ...newGliderPortfolio1
    });
    expect(response).toStrictEqual(dbGliderPortfolios[0]);
  });

  it('throws error if Glider Portfolio already exists for WireTap account', async () => {
    await createGliderPortfolio(db, newGliderPortfolio1);
    await expect(
      createGliderPortfolio(db, newGliderPortfolio2)
    ).rejects.toThrow(
      expect.objectContaining({
        code: '23505', // unique constraint violation
        constraint: 'glider_portfolios_portfolio_id_unique'
      })
    );
  });
});
