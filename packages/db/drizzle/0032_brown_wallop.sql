CREATE INDEX "tokens_created_at_idx" ON "tokens" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tokens_created_at_id_idx" ON "tokens" USING btree ("created_at","id");