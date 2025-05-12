CREATE TABLE "pools" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_id" integer NOT NULL,
	"currency_id" integer NOT NULL,
	"pool_address" text NOT NULL,
	"is_primary" boolean NOT NULL,
	"fee_bps" integer NOT NULL,
	"ath_mcap_usd" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"decimals" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "total_supply" bigint NOT NULL DEFAULT 100000000000;--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "total_supply" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pools_address_lower_unique" ON "pools" USING btree (lower("pool_address"));--> statement-breakpoint
CREATE UNIQUE INDEX "currencies_address_lower_unique" ON "currencies" USING btree (lower("address"));