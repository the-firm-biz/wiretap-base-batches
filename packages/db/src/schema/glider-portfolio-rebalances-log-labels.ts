import { pgTable, smallint, text } from 'drizzle-orm/pg-core';
import type {
  RebalancesLogLabel,
  RebalancesLogLabelNames
} from '@wiretap/utils/server';
import type { InferSelectModel } from 'drizzle-orm';

export const gliderPortfolioRebalancesLogLabels = pgTable(
  'glider_portfolio_rebalances_log_labels',
  {
    id: smallint('id')
      .primaryKey()
      .$type<RebalancesLogLabel>(),
    name: text('name').notNull().$type<RebalancesLogLabelNames>()
  }
);

export type GliderPortfolioRebalancesLogLabelType = InferSelectModel<
  typeof gliderPortfolioRebalancesLogLabels
>;
