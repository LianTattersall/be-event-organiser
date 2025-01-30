import { boolean, date, integer, numeric, pgTable, serial, text, time } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	user_id: text('user_id').primaryKey(),
	email: text('email').unique(),
	name: text('name'),
	admin: boolean('admin'),
});

export const events = pgTable('events', {
	event_id: serial('event_id').primaryKey(),
	event_name: text('event_name').notNull(),
	event_date: date('event_date').notNull(),
	start_time: time('start_time').notNull(),
	end_time: time('end_time'),
	description: text('description').notNull(),
	organiser_id: text('organiser_id')
		.notNull()
		.references(() => users.user_id, { onDelete: 'cascade' }),
	signup_limit: integer('signup_limit'),
	image_URL: text('image_URL'),
	price: numeric('price', { precision: 100, scale: 2 }),
	postcode: text('postcode').notNull(),
	firstline_address: text('firstline_address').notNull(),
});

export const saved_events = pgTable('saved_events', {
	event_id: integer('event_id')
		.references(() => events.event_id, { onDelete: 'cascade' })
		.notNull(),
	user_id: text('user_id')
		.references(() => users.user_id, { onDelete: 'cascade' })
		.notNull(),
});

export const sign_ups = pgTable('sign_ups', {
	event_id: integer('event_id')
		.references(() => events.event_id, { onDelete: 'cascade' })
		.notNull(),
	user_id: text('user_id')
		.references(() => users.user_id, { onDelete: 'cascade' })
		.notNull(),
});

export const external_saved = pgTable('external_saved', {
	event_id: text('event_id').notNull(),
	user_id: text('user_id')
		.references(() => users.user_id, { onDelete: 'cascade' })
		.notNull(),
});
