import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { events, sign_ups } from '../db/schema';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { currentEvents, currentEventsAndSearch, searchResults } from './query-builder';

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
