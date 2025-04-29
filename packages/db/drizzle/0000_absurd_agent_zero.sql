CREATE TABLE "deployer_entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farcaster_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"fid" integer NOT NULL,
	"deployer_entity_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "farcaster_accounts_fid_unique" UNIQUE("fid")
);
--> statement-breakpoint
CREATE TABLE "wallet_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"deployer_entity_id" integer NOT NULL,
	"verification_source" text DEFAULT 'farcaster' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_addresses_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "x_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"xid" text NOT NULL,
	"username" text NOT NULL,
	"deployer_entity_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "x_accounts_xid_unique" UNIQUE("xid")
);
--> statement-breakpoint
ALTER TABLE "farcaster_accounts" ADD CONSTRAINT "farcaster_accounts_deployer_entity_id_deployer_entities_id_fk" FOREIGN KEY ("deployer_entity_id") REFERENCES "public"."deployer_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_addresses" ADD CONSTRAINT "wallet_addresses_deployer_entity_id_deployer_entities_id_fk" FOREIGN KEY ("deployer_entity_id") REFERENCES "public"."deployer_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_accounts" ADD CONSTRAINT "x_accounts_deployer_entity_id_deployer_entities_id_fk" FOREIGN KEY ("deployer_entity_id") REFERENCES "public"."deployer_entities"("id") ON DELETE no action ON UPDATE no action;