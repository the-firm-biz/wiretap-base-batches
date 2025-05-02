ALTER TABLE "tokens" ALTER COLUMN "block" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_block_blocks_number_fk" FOREIGN KEY ("block") REFERENCES "public"."blocks"("number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tokens_block_idx" ON "tokens" USING btree ("name");