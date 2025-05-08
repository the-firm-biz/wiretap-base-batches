CREATE TABLE "glider_portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"wire_tap_account_id" integer NOT NULL,
	"portfolio_id" integer NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "glider_portfolios_portfolio_id_unique" UNIQUE("portfolio_id")
);
--> statement-breakpoint
CREATE TABLE "targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"wire_tap_account_id" integer NOT NULL,
	"target_account_entity_id" integer NOT NULL,
	"max_spend" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "glider_portfolios" ADD CONSTRAINT "glider_portfolios_wire_tap_account_id_wire_tap_accounts_id_fk" FOREIGN KEY ("wire_tap_account_id") REFERENCES "public"."wire_tap_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "targets" ADD CONSTRAINT "targets_wire_tap_account_id_wire_tap_accounts_id_fk" FOREIGN KEY ("wire_tap_account_id") REFERENCES "public"."wire_tap_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "targets" ADD CONSTRAINT "targets_target_account_entity_id_account_entities_id_fk" FOREIGN KEY ("target_account_entity_id") REFERENCES "public"."account_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "glider_portfolio_wire_tap_account_id_unique" ON "glider_portfolios" USING btree ("wire_tap_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "targets_wire_tap_account_target_unique" ON "targets" USING btree ("wire_tap_account_id","target_account_entity_id");