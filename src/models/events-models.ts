import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { events, sign_ups, users } from '../db/schema';
import { and, asc, desc, eq, gt, lt, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { currentEvents, currentEventsAndSearch, searchResults, signedUpUserSearch } from './query-builder';

export const fetchEvents = async (
	connectionStr: string,
	l: number,
	p: number,
	sortby: string,
	orderby: string,
	type: string,
	searchTerm: string
) => {
	if (!l || !p) {
		throw new HTTPException(400, { message: '400 - Invalid data type for query' });
	}

	if (!['asc', 'desc'].includes(orderby)) {
		throw new HTTPException(400, { message: '400 - Invalid query for orderby' });
	}

	if (!['id', 'date', 'price'].includes(sortby)) {
		throw new HTTPException(400, { message: '400 - Invalid query for sortby' });
	}

	if (!['all', 'current'].includes(type)) {
		throw new HTTPException(400, { message: '400 - Invalid query for type' });
	}

	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const queryToColumn = { id: events.event_id, date: events.event_date, price: events.price };
	const sortbyColumn = queryToColumn[sortby as keyof typeof queryToColumn];
	const orderByQuery = orderby === 'asc' ? asc(sortbyColumn) : desc(sortbyColumn);

	const events_data = db
		.select({
			event_id: events.event_id,
			event_name: events.event_name,
			event_date: events.event_date,
			start_time: events.start_time,
			end_time: events.end_time,
			image_URL: events.image_URL,
			signup_limit: events.signup_limit,
			price: events.price,
			firstline_address: events.firstline_address,
			image_description: events.image_description,
			signups: sql`CAST(COALESCE(COUNT(${sign_ups.user_id}), 0) AS INT)`,
		})
		.from(events)
		.leftJoin(sign_ups, eq(sign_ups.event_id, events.event_id))
		.groupBy(events.event_id)
		.orderBy(orderByQuery)
		.limit(l)
		.offset(l * (p - 1));

	if (type === 'current' && searchTerm) {
		return currentEventsAndSearch(events_data.$dynamic(), searchTerm);
	} else if (type === 'current') {
		return currentEvents(events_data.$dynamic());
	}

	if (searchTerm) {
		return searchResults(events_data.$dynamic(), searchTerm);
	}
	return events_data;
};

export const fetchEventById = async (connectionStr: string, event_id: number) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const event_data = await db.select().from(events).where(eq(events.event_id, event_id));

	if (event_data.length === 0) {
		throw new HTTPException(404, { message: '404 - Event not found' });
	}

	const signups = await db
		.select({ signups: sql`CAST(COALESCE(COUNT(${sign_ups.user_id}), 0) AS INT)` })
		.from(events)
		.leftJoin(sign_ups, eq(events.event_id, sign_ups.event_id))
		.where(eq(events.event_id, event_id));
	const organiser_data = await db
		.select({ organiser_name: users.name, organiser_email: users.email })
		.from(events)
		.leftJoin(users, eq(users.user_id, events.organiser_id))
		.where(eq(events.event_id, event_id));
	return { ...event_data[0], ...signups[0], ...organiser_data[0] };
};

export const removeEventById = async (connectionStr: string, event_id: number) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const deleted_event = await db.delete(events).where(eq(events.event_id, event_id)).returning();
	if (deleted_event.length === 0) {
		throw new HTTPException(404, { message: '404 - Event not found' });
	}
};

interface Event {
	event_name: string;
	event_date: string;
	start_time: string;
	end_time: string;
	price: string;
	image_URL: string;
	signup_limit: number;
	description: string;
	organiser_id: string;
	postcode: string;
	firstline_address: string;
	image_description: string;
}

export const addEvent = async (connectionStr: string, eventToPost: Event) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);
	const {
		event_name,
		event_date,
		start_time,
		end_time,
		price,
		image_URL,
		signup_limit,
		description,
		organiser_id,
		postcode,
		firstline_address,
		image_description,
	} = eventToPost;
	const posted = await db
		.insert(events)
		.values([
			{
				event_name,
				event_date,
				start_time,
				end_time,
				price,
				image_URL,
				signup_limit,
				description,
				organiser_id,
				postcode,
				firstline_address,
				image_description,
			},
		])
		.returning();
	return posted[0];
};

export const fetchEventSignups = async (connectionStr: string, event_id: number, searchTerm: string, p: number, limit: number) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	if (!limit || !p) {
		throw new HTTPException(400, { message: '400 - Invalid data type for query' });
	}

	const event = await db.select().from(events).where(eq(events.event_id, event_id));
	if (event.length === 0) {
		throw new HTTPException(404, { message: '404 - Event not found' });
	}

	const signedUpUsers = db
		.select({ name: users.name, email: users.email })
		.from(sign_ups)
		.innerJoin(users, eq(sign_ups.user_id, users.user_id))
		.limit(limit)
		.offset((p - 1) * limit)
		.orderBy(users.name)
		.$dynamic();

	if (searchTerm) {
		return signedUpUserSearch(signedUpUsers, searchTerm, event_id);
	}
	return signedUpUsers.where(eq(sign_ups.event_id, event_id));
};

export const fetchOrganisersEvents = async (connectionStr: string, organiser_id: any, p: number, limit: number, type: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	if (!limit || !p) {
		throw new HTTPException(400, { message: '400 - Invalid data type for query' });
	}

	const user = await db.select().from(users).where(eq(users.user_id, organiser_id));
	if (user.length == 0) {
		throw new HTTPException(404, { message: '404 - Organiser not found' });
	}
	if (user && !user[0].admin) {
		throw new HTTPException(404, { message: '404 - Organiser not found' });
	}

	const organisersEvents = db
		.select({
			event_id: events.event_id,
			event_name: events.event_name,
			event_date: events.event_date,
			start_time: events.start_time,
			end_time: events.end_time,
			image_URL: events.image_URL,
			signup_limit: events.signup_limit,
			price: events.price,
			signups: sql`CAST(COALESCE(COUNT(${sign_ups.user_id}), 0) AS INT)`,
		})
		.from(events)
		.leftJoin(sign_ups, eq(sign_ups.event_id, events.event_id))
		.groupBy(events.event_id)
		.limit(limit)
		.offset((p - 1) * limit)
		.$dynamic();

	if (type == 'curr') {
		const date = new Date();
		return organisersEvents.where(
			and(eq(events.organiser_id, organiser_id), gt(events.event_date, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`))
		);
	}
	if (type == 'past') {
		const date = new Date();
		return organisersEvents.where(
			and(eq(events.organiser_id, organiser_id), lt(events.event_date, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`))
		);
	}

	return organisersEvents.where(eq(events.organiser_id, organiser_id));
};

export const updateEvent = async (connectionStr: string, event_id: number, patchInfo: any) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const updatedEvent = await db.update(events).set(patchInfo).where(eq(events.event_id, event_id)).returning();
	if (updatedEvent.length == 0) {
		throw new HTTPException(404, { message: '404 - Event not found' });
	}

	return updatedEvent[0];
};
