ALTER TABLE "wallet_addresses" DROP CONSTRAINT "wallet_addresses_address_unique";--> statement-breakpoint
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_address_unique";--> statement-breakpoint
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_address_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_addresses_address_lower_unique" ON "wallet_addresses" USING btree (lower("address"));--> statement-breakpoint
CREATE UNIQUE INDEX "contracts_address_lower_unique" ON "contracts" USING btree (lower("address"));--> statement-breakpoint
CREATE UNIQUE INDEX "tokens_address_lower_unique" ON "tokens" USING btree (lower("address"));