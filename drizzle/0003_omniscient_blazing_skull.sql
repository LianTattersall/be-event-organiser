ALTER TABLE "saved_events" DROP CONSTRAINT "saved_events_event_id_events_event_id_fk";
--> statement-breakpoint
ALTER TABLE "sign_ups" DROP CONSTRAINT "sign_ups_event_id_events_event_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sign_ups" ADD CONSTRAINT "sign_ups_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE cascade ON UPDATE no action;