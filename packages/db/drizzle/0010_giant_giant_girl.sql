CREATE TABLE "blocks" (
	"number" bigint PRIMARY KEY NOT NULL,
	"timestamp" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "block" bigint;