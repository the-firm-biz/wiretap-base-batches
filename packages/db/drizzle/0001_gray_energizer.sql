CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contracts_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"symbol" text,
	"address" text NOT NULL,
	"deployment_contract_id" integer NOT NULL,
	"token_creator_entity_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tokens_address_unique" UNIQUE("address")
);
--> statement-breakpoint
ALTER TABLE "deployer_entities" RENAME TO "token_creator_entities";--> statement-breakpoint
ALTER TABLE "farcaster_accounts" RENAME COLUMN "deployer_entity_id" TO "token_creator_entity_id";--> statement-breakpoint
ALTER TABLE "wallet_addresses" RENAME COLUMN "deployer_entity_id" TO "token_creator_entity_id";--> statement-breakpoint
ALTER TABLE "x_accounts" RENAME COLUMN "deployer_entity_id" TO "token_creator_entity_id";--> statement-breakpoint
ALTER TABLE "farcaster_accounts" DROP CONSTRAINT "farcaster_accounts_deployer_entity_id_deployer_entities_id_fk";
--> statement-breakpoint
ALTER TABLE "wallet_addresses" DROP CONSTRAINT "wallet_addresses_deployer_entity_id_deployer_entities_id_fk";
--> statement-breakpoint
ALTER TABLE "x_accounts" DROP CONSTRAINT "x_accounts_deployer_entity_id_deployer_entities_id_fk";
--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_deployment_contract_id_contracts_id_fk" FOREIGN KEY ("deployment_contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_token_creator_entity_id_token_creator_entities_id_fk" FOREIGN KEY ("token_creator_entity_id") REFERENCES "public"."token_creator_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farcaster_accounts" ADD CONSTRAINT "farcaster_accounts_token_creator_entity_id_token_creator_entities_id_fk" FOREIGN KEY ("token_creator_entity_id") REFERENCES "public"."token_creator_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_addresses" ADD CONSTRAINT "wallet_addresses_token_creator_entity_id_token_creator_entities_id_fk" FOREIGN KEY ("token_creator_entity_id") REFERENCES "public"."token_creator_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_accounts" ADD CONSTRAINT "x_accounts_token_creator_entity_id_token_creator_entities_id_fk" FOREIGN KEY ("token_creator_entity_id") REFERENCES "public"."token_creator_entities"("id") ON DELETE no action ON UPDATE no action;