ALTER TABLE "pools" ADD COLUMN "starting_mcap_usd" double precision NOT NULL DEFAULT 25000;--> statement-breakpoint
ALTER TABLE "pools" ALTER COLUMN "starting_mcap_usd" DROP DEFAULT;
