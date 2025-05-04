CREATE TABLE "wire_tap_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_entity_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wire_tap_session_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"wire_tap_account_id" integer NOT NULL,
	"encrypted_session_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verification_sources" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "wire_tap_accounts" ADD CONSTRAINT "wire_tap_accounts_account_entity_id_account_entities_id_fk" FOREIGN KEY ("account_entity_id") REFERENCES "public"."account_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wire_tap_session_keys" ADD CONSTRAINT "wire_tap_session_keys_wire_tap_account_id_wire_tap_accounts_id_fk" FOREIGN KEY ("wire_tap_account_id") REFERENCES "public"."wire_tap_accounts"("id") ON DELETE no action ON UPDATE no action;