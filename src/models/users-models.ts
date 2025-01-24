import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { events, saved_events, sign_ups, users } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

type User = { name: string; email: string; admin: boolean };

export const fetchUserById = async (user_id: number, connectionStr: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);
	const user_data = await db.select().from(users).where(eq(users.user_id, user_id));
	if (user_data.length == 0) {
		throw new HTTPException(404, { message: '404 - User not found' });
	}
	return user_data[0];
};

export const addUser = async (userDetails: User, connectionStr: string) => {
	const { name, email, admin } = userDetails;
	if (!(typeof name == 'string' && typeof email == 'string' && typeof admin == 'boolean')) {
		throw new HTTPException(400, { message: '400 - Invalid data type on request body' });
	}
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);
	await db.insert(users).values({ name, email, admin });
	return { name, email, admin };
};

export const removeUserById = async (user_id: number, connectionStr: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);
	const data = await db.delete(users).where(eq(users.user_id, user_id)).returning();
	if (data.length === 0) {
		throw new HTTPException(404, { message: '404 - User not found' });
	}
};

export const fetchSignupsByUserId = async (connectionStr: string, user_id: number, limit: number, p: number) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	if (!limit || !p) {
		throw new HTTPException(400, { message: '400 - Invalid data type for query' });
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
		.where(eq(sign_ups.user_id, user_id))
		.limit(limit)
		.offset((p - 1) * limit);

	return signups;
};

export const addSignupByUserId = async (connectionStr: string, user_id: number, event_id: number) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

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

export const fetchSavedByUserId = async (connectionStr: string, user_id: number, limit: number, p: number) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	if (!limit || !p) {
		throw new HTTPException(400, { message: '400 - Invalid data type for query' });
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
		.where(eq(saved_events.user_id, user_id))
		.limit(limit)
		.offset((p - 1) * limit);

	return savedEvents;
};

export const addSavedByUserId = async (connectionStr: string, user_id: number, event_id: number) => {
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
