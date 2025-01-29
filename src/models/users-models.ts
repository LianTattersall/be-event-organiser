import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { events, saved_events, sign_ups, users } from '../db/schema';
import { and, asc, eq, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { currSaved, currSignups, pastSaved, pastSignups } from './query-builder';

type User = { name: string; email: string; admin: boolean; user_id: string };

export const fetchUserById = async (user_id: string, connectionStr: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);
	const user_data = await db.select().from(users).where(eq(users.user_id, user_id));
	if (user_data.length == 0) {
		throw new HTTPException(404, { message: '404 - User not found' });
	}
	return user_data[0];
};

export const addUser = async (userDetails: User, connectionStr: string) => {
	const { name, email, admin, user_id } = userDetails;
	if (!(typeof name == 'string' && typeof email == 'string' && typeof admin == 'boolean' && typeof user_id == 'string')) {
		throw new HTTPException(400, { message: '400 - Invalid data type on request body' });
	}
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);
	await db.insert(users).values({ name, email, admin, user_id });
	return { name, email, admin, user_id };
};

export const removeUserById = async (user_id: string, connectionStr: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);
	const data = await db.delete(users).where(eq(users.user_id, user_id)).returning();

	if (data.length === 0) {
		throw new HTTPException(404, { message: '404 - User not found' });
	}
};

export const fetchSignupsByUserId = async (connectionStr: string, user_id: string, limit: number, p: number, type: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	if (!limit || !p) {
		throw new HTTPException(400, { message: '400 - Invalid data type for query' });
	}

	if (!['curr', 'past', ''].includes(type)) {
		throw new HTTPException(400, { message: '400 - Invalid query for type' });
	}

	const userDetails = await db.select().from(users).where(eq(users.user_id, user_id));
	if (userDetails.length === 0) {
		throw new HTTPException(404, { message: '404 - User not found' });
	}

	const signups = db
		.select({
			event_id: events.event_id,
			event_name: events.event_name,
			event_date: events.event_date,
			start_time: events.start_time,
			end_time: events.end_time,
			image_URL: events.image_URL,
			signup_limit: events.signup_limit,
			price: events.price,
		})
		.from(events)
		.innerJoin(sign_ups, eq(sign_ups.event_id, events.event_id))
		.limit(limit)
		.offset((p - 1) * limit)
		.orderBy(asc(events.event_date))
		.$dynamic();

	if (type == 'curr') {
		return currSignups(signups, user_id);
	}
	if (type == 'past') {
		return pastSignups(signups, user_id);
	}

	return signups.where(eq(sign_ups.user_id, user_id));
};

export const addSignupByUserId = async (connectionStr: string, user_id: string, event_id: number) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const event = await db
		.select({
			date: events.event_date,
			signups: sql`CAST(COALESCE(COUNT(${sign_ups.user_id}), 0) AS INT)`,
			signup_limit: events.signup_limit,
		})
		.from(events)
		.where(eq(events.event_id, event_id))
		.leftJoin(sign_ups, eq(events.event_id, sign_ups.event_id))
		.groupBy(events.event_date, events.signup_limit);

	if (event.length != 0) {
		if (new Date().getTime() > new Date(event[0].date).getTime()) {
			throw new HTTPException(422, { message: '422 - Event has expired' });
		}
		if (Number(event[0].signups) >= Number(event[0].signup_limit) && event[0].signup_limit != null) {
			throw new HTTPException(409, { message: "409 - Event has reached it's signup limit" });
		}
	}
	const savedAlready = await db
		.select()
		.from(sign_ups)
		.where(and(eq(sign_ups.event_id, event_id), eq(sign_ups.user_id, user_id)));
	if (savedAlready.length != 0) {
		throw new HTTPException(403, { message: '403 - Resource already exists' });
	}

	await db.insert(sign_ups).values({ user_id, event_id });
	return { user_id, event_id };
};

export const removeSignup = async (connectionStr: string, user_id: string, event_id: number) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const removed = await db
		.delete(sign_ups)
		.where(and(eq(sign_ups.event_id, event_id), eq(sign_ups.user_id, user_id)))
		.returning();

	if (removed.length == 0) {
		throw new HTTPException(404, { message: '404 - Resource not found' });
	}
};

export const fetchSavedByUserId = async (connectionStr: string, user_id: string, limit: number, p: number, type: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	if (!limit || !p) {
		throw new HTTPException(400, { message: '400 - Invalid data type for query' });
	}

	if (!['curr', 'past', ''].includes(type)) {
		throw new HTTPException(400, { message: '400 - Invalid query for type' });
	}

	const userDetails = await db.select().from(users).where(eq(users.user_id, user_id));
	if (userDetails.length === 0) {
		throw new HTTPException(404, { message: '404 - User not found' });
	}

	const savedEvents = db
		.select({
			event_id: events.event_id,
			event_name: events.event_name,
			event_date: events.event_date,
			start_time: events.start_time,
			end_time: events.end_time,
			image_URL: events.image_URL,
			signup_limit: events.signup_limit,
			price: events.price,
		})
		.from(events)
		.innerJoin(saved_events, eq(saved_events.event_id, events.event_id))
		.limit(limit)
		.offset((p - 1) * limit)
		.orderBy(asc(events.event_date))
		.$dynamic();

	if (type == 'curr') {
		return currSaved(savedEvents, user_id);
	}
	if (type == 'past') {
		return pastSaved(savedEvents.$dynamic(), user_id);
	}

	return savedEvents.where(eq(saved_events.user_id, user_id));
};

export const addSavedByUserId = async (connectionStr: string, user_id: string, event_id: number) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const savedAlready = await db
		.select()
		.from(saved_events)
		.where(and(eq(saved_events.event_id, event_id), eq(saved_events.user_id, user_id)));
	if (savedAlready.length != 0) {
		throw new HTTPException(403, { message: '403 - Resource already exists' });
	}

	await db.insert(saved_events).values({ user_id, event_id });
	return { user_id, event_id };
};

export const removeSaved = async (connectionStr: string, user_id: string, event_id: number) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const removed = await db
		.delete(saved_events)
		.where(and(eq(saved_events.event_id, event_id), eq(saved_events.user_id, user_id)))
		.returning();

	if (removed.length == 0) {
		throw new HTTPException(404, { message: '404 - Resource not found' });
	}
};
