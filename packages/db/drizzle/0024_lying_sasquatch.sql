CREATE TABLE "glider_portfolio_rebalances" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"token_id" integer NOT NULL,
	"portfolio_eth_balance_wei" bigint NOT NULL,
	"token_ratio_bps" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "glider_portfolio_rebalances_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"glider_portfolio_rebalances_id" integer NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"glider_rebalance_id" text,
	"response" jsonb
);
--> statement-breakpoint
DROP INDEX "tokens_block_idx";--> statement-breakpoint
ALTER TABLE "glider_portfolio_rebalances" ADD CONSTRAINT "glider_portfolio_rebalances_portfolio_id_glider_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."glider_portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glider_portfolio_rebalances" ADD CONSTRAINT "glider_portfolio_rebalances_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glider_portfolio_rebalances_log" ADD CONSTRAINT "glider_portfolio_rebalances_log_glider_portfolio_rebalances_id_glider_portfolio_rebalances_id_fk" FOREIGN KEY ("glider_portfolio_rebalances_id") REFERENCES "public"."glider_portfolio_rebalances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tokens_account_entity_id_idx" ON "tokens" USING btree ("account_entity_id");