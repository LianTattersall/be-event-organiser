CREATE TABLE "events" (
	"event_id" serial PRIMARY KEY NOT NULL,
	"event_name" text,
	"event_date" date,
	"start_time" time,
	"end_time" time,
	"description" text,
	"organiser_id" integer NOT NULL,
	"signup_limit" integer,
	"image_URL" text
);
--> statement-breakpoint
CREATE TABLE "saved_events" (
	"event_id" integer,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "sign_ups" (
	"event_id" integer,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"name" text,
	"admin" boolean
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organiser_id_users_user_id_fk" FOREIGN KEY ("organiser_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sign_ups" ADD CONSTRAINT "sign_ups_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sign_ups" ADD CONSTRAINT "sign_ups_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;