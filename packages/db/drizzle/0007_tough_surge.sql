ALTER TABLE "token_creator_entities" RENAME TO "account_entities";--> statement-breakpoint
ALTER TABLE "farcaster_accounts" RENAME COLUMN "token_creator_entity_id" TO "account_entity_id";--> statement-breakpoint
ALTER TABLE "account_entities" RENAME COLUMN "name" TO "label";--> statement-breakpoint
ALTER TABLE "wallet_addresses" RENAME COLUMN "token_creator_entity_id" TO "account_entity_id";--> statement-breakpoint
ALTER TABLE "x_accounts" RENAME COLUMN "token_creator_entity_id" TO "account_entity_id";--> statement-breakpoint
ALTER TABLE "tokens" RENAME COLUMN "token_creator_entity_id" TO "account_entity_id";--> statement-breakpoint
ALTER TABLE "farcaster_accounts" DROP CONSTRAINT "farcaster_accounts_token_creator_entity_id_unique";--> statement-breakpoint
ALTER TABLE "farcaster_accounts" DROP CONSTRAINT "farcaster_accounts_token_creator_entity_id_token_creator_entities_id_fk";
--> statement-breakpoint
ALTER TABLE "wallet_addresses" DROP CONSTRAINT "wallet_addresses_token_creator_entity_id_token_creator_entities_id_fk";
--> statement-breakpoint
ALTER TABLE "x_accounts" DROP CONSTRAINT "x_accounts_token_creator_entity_id_token_creator_entities_id_fk";
--> statement-breakpoint
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_token_creator_entity_id_token_creator_entities_id_fk";
--> statement-breakpoint
ALTER TABLE "farcaster_accounts" ADD CONSTRAINT "farcaster_accounts_account_entity_id_account_entities_id_fk" FOREIGN KEY ("account_entity_id") REFERENCES "public"."account_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_addresses" ADD CONSTRAINT "wallet_addresses_account_entity_id_account_entities_id_fk" FOREIGN KEY ("account_entity_id") REFERENCES "public"."account_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_accounts" ADD CONSTRAINT "x_accounts_account_entity_id_account_entities_id_fk" FOREIGN KEY ("account_entity_id") REFERENCES "public"."account_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_account_entity_id_account_entities_id_fk" FOREIGN KEY ("account_entity_id") REFERENCES "public"."account_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farcaster_accounts" ADD CONSTRAINT "farcaster_accounts_account_entity_id_unique" UNIQUE("account_entity_id");