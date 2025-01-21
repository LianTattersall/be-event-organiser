ALTER TABLE "events" DROP CONSTRAINT "events_organiser_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_events" DROP CONSTRAINT "saved_events_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "sign_ups" DROP CONSTRAINT "sign_ups_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organiser_id_users_user_id_fk" FOREIGN KEY ("organiser_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sign_ups" ADD CONSTRAINT "sign_ups_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;