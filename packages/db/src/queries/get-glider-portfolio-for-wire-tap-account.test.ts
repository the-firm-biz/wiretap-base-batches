import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { accountEntities, wireTapAccounts } from '../schema/accounts/index.js';
import {
  gliderPortfolios,
  type NewGliderPortfolio
} from '../schema/glider-portfolio.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getGliderPortfolioForWireTapAccount } from './get-glider-portfolio-for-wire-tap-account.js';

describe('getWireTapAccount', () => {
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
    await db.insert(gliderPortfolios).values(newGliderPortfolio);
  });

  it('returns Glider Portfolio if exists', async () => {
    const response = await getGliderPortfolioForWireTapAccount(
      db,
      newGliderPortfolio.wireTapAccountId
    );
    expect(response).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      updatedAt: null,
      ...newGliderPortfolio
    });
  });

  it('returns undefined if Glider Portfolio does not exist', async () => {
    const response = await getGliderPortfolioForWireTapAccount(db, 99999);
    expect(response).toBeUndefined();
  });
});
