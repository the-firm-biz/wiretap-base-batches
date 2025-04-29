ALTER TABLE "wallet_addresses" RENAME TO "wallets";--> statement-breakpoint
ALTER TABLE "wallets" DROP CONSTRAINT "wallet_addresses_account_entity_id_account_entities_id_fk";
--> statement-breakpoint
ALTER TABLE "wallets" DROP CONSTRAINT "wallet_addresses_verification_source_id_verification_sources_id_fk";
--> statement-breakpoint
DROP INDEX "wallet_addresses_address_lower_unique";--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_account_entity_id_account_entities_id_fk" FOREIGN KEY ("account_entity_id") REFERENCES "public"."account_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_verification_source_id_verification_sources_id_fk" FOREIGN KEY ("verification_source_id") REFERENCES "public"."verification_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_address_lower_unique" ON "wallets" USING btree (lower("address"));