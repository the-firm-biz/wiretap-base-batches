ALTER TABLE "targets" RENAME TO "account_entity_trackers";--> statement-breakpoint
ALTER TABLE "account_entity_trackers" RENAME COLUMN "wire_tap_account_id" TO "tracker_wire_tap_account_id";--> statement-breakpoint
ALTER TABLE "account_entity_trackers" RENAME COLUMN "target_account_entity_id" TO "tracked_account_entity_id";--> statement-breakpoint
ALTER TABLE "account_entity_trackers" DROP CONSTRAINT "targets_wire_tap_account_id_wire_tap_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "account_entity_trackers" DROP CONSTRAINT "targets_target_account_entity_id_account_entities_id_fk";
--> statement-breakpoint
DROP INDEX "targets_wire_tap_account_target_unique";--> statement-breakpoint
ALTER TABLE "account_entity_trackers" ADD CONSTRAINT "account_entity_trackers_tracker_wire_tap_account_id_wire_tap_accounts_id_fk" FOREIGN KEY ("tracker_wire_tap_account_id") REFERENCES "public"."wire_tap_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_entity_trackers" ADD CONSTRAINT "account_entity_trackers_tracked_account_entity_id_account_entities_id_fk" FOREIGN KEY ("tracked_account_entity_id") REFERENCES "public"."account_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tracked_account_entities_tracker_wire_tap_account_id_tracked_account_entity_id_unique" ON "account_entity_trackers" USING btree ("tracker_wire_tap_account_id","tracked_account_entity_id");