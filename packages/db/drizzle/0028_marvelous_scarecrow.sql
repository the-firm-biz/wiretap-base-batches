ALTER TABLE "glider_portfolio_rebalances_log" ADD COLUMN "label" text NOT NULL;--> statement-breakpoint
ALTER TABLE "glider_portfolio_rebalances_log" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "glider_portfolio_rebalances_log" ADD COLUMN "glider_rebalance_id" text;--> statement-breakpoint
ALTER TABLE "glider_portfolio_rebalances_log" DROP COLUMN "action";--> statement-breakpoint
ALTER TABLE "glider_portfolio_rebalances_log" DROP COLUMN "gliderRebalanceId";