ALTER TABLE "saved_events" ALTER COLUMN "event_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_events" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sign_ups" ALTER COLUMN "event_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sign_ups" ALTER COLUMN "user_id" SET NOT NULL;