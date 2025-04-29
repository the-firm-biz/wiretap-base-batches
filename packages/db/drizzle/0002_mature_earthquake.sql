CREATE TABLE "verification_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallet_addresses" ADD COLUMN "verification_source_id" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "verification_source_name_unique" ON "verification_sources" USING btree (LOWER("name"));--> statement-breakpoint
ALTER TABLE "wallet_addresses" ADD CONSTRAINT "wallet_addresses_verification_source_id_verification_sources_id_fk" FOREIGN KEY ("verification_source_id") REFERENCES "public"."verification_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_addresses" DROP COLUMN "verification_source";