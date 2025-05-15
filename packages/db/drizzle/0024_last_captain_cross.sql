DROP INDEX "tokens_block_idx";--> statement-breakpoint
CREATE INDEX "tokens_account_entity_id_idx" ON "tokens" USING btree ("account_entity_id");