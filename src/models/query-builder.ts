import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';
import { events, saved_events, sign_ups, users } from '../db/schema';

export function currentEvents<T extends PgSelect>(qb: T) {
	const date = new Date();
	return qb
		.having(({ signups, signup_limit }) => gt(signup_limit, signups))
		.where(gt(events.event_date, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`));
}

export function searchResults<T extends PgSelect>(qb: T, searchTerm: string) {
	return qb.where(sql`to_tsvector('english', ${events.event_name}) @@ plainto_tsquery('english', ${searchTerm})`);
}

export function currentEventsAndSearch<T extends PgSelect>(qb: T, searchTerm: string) {
	const date = new Date();
	return qb
		.having(({ signups, signup_limit }) => gt(signup_limit, signups))
		.where(
			and(
				gt(events.event_date, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`),
				sql`to_tsvector('english', ${events.event_name}) @@ plainto_tsquery('english', ${searchTerm})`
			)
		);
}

export function signedUpUserSearch<T extends PgSelect>(qb: T, searchTerm: string, event_id: number) {
	return qb.where(
		and(eq(sign_ups.event_id, event_id), sql`to_tsvector('english', ${users.name}) @@ plainto_tsquery('english', ${searchTerm})`)
	);
}

export function currSignups<T extends PgSelect>(qb: T, user_id: string) {
	const date = new Date();
	return qb.where(
		and(eq(sign_ups.user_id, user_id), gt(events.event_date, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`))
	);
}

export function pastSignups<T extends PgSelect>(qb: T, user_id: string) {
	const date = new Date();
	return qb.where(
		and(eq(sign_ups.user_id, user_id), lt(events.event_date, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`))
	);
}

export function currSaved<T extends PgSelect>(qb: T, user_id: string) {
	const date = new Date();
	return qb.where(
		and(eq(saved_events.user_id, user_id), gt(events.event_date, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`))
	);
}

export function pastSaved<T extends PgSelect>(qb: T, user_id: string) {
	const date = new Date();
	return qb.where(
		and(eq(saved_events.user_id, user_id), lt(events.event_date, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`))
	);
}
