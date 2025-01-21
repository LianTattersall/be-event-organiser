import { boolean, date, integer, pgTable, serial, text, time } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	user_id: serial('user_id').primaryKey(),
	email: text('email').unique(),
	name: text('name'),
	admin: boolean('admin'),
});

export const events = pgTable('events', {
	event_id: serial('event_id').primaryKey(),
	event_name: text('event_name'),
	event_date: date('event_date'),
	start_time: time('start_time'),
	end_time: time('end_time'),
	description: text('description'),
	organiser_id: integer('organiser_id')
		.notNull()
		.references(() => users.user_id),
	signup_limit: integer('signup_limit'),
	image_URL: text('image_URL'),
});

export const saved_events = pgTable('saved_events', {
	event_id: integer('event_id').references(() => events.event_id),
	user_id: integer('user_id').references(() => users.user_id),
});

export const sign_ups = pgTable('sign_ups', {
	event_id: integer('event_id').references(() => events.event_id),
	user_id: integer('user_id').references(() => users.user_id),
});
