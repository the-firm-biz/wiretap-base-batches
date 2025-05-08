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

  let newGliderPortfolio: NewGliderPortfolio;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    const [testWireTapAccount] = await db
      .insert(wireTapAccounts)
      .values({
        accountEntityId: testAccountEntity!.id
      })
      .returning();
    newGliderPortfolio = {
      wireTapAccountId: testWireTapAccount!.id,
      portfolioId: 'k12345',
      updatedAt: null,
      address: '0x1234567890123456789012345678901234567890'
    };
  });

  it('creates and returns Glider Portfolio', async () => {
    const response = await createGliderPortfolio(db, newGliderPortfolio);
    const dbGliderPortfolios = await db.select().from(gliderPortfolios);
    expect(dbGliderPortfolios.length).toBe(1);
    expect(dbGliderPortfolios[0]!).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      ...newGliderPortfolio
    });
    expect(response).toStrictEqual(dbGliderPortfolios[0]);
  });

  it('throws error if Glider Portfolio already exists for WireTap account', async () => {
    await createGliderPortfolio(db, newGliderPortfolio);
    await expect(createGliderPortfolio(db, newGliderPortfolio)).rejects.toThrow(
      expect.objectContaining({
        code: '23505', // unique constraint violation
        constraint: 'glider_portfolios_portfolio_id_unique'
      })
    );
  });
});
