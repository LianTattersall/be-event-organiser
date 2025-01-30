import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { external_saved, users } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export const fetchExternalSavedEvents = async (connectionStr: string, user_id: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const user = await db.select().from(users).where(eq(users.user_id, user_id));
	if (user.length == 0) {
		throw new HTTPException(404, { message: '404 - User not found' });
	}

	const saved_ids = db.select({ event_id: external_saved.event_id }).from(external_saved).where(eq(external_saved.user_id, user_id));
	return saved_ids;
};

export const addExternalSaved = async (connectionStr: string, user_id: string, event_id: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const user = await db.select().from(users).where(eq(users.user_id, user_id));
	if (user.length == 0) {
		throw new HTTPException(404, { message: '404 - User not found' });
	}

	const savedAlready = await db
		.select()
		.from(external_saved)
		.where(and(eq(external_saved.user_id, user_id), eq(external_saved.event_id, event_id)));
	if (savedAlready.length != 0) {
		throw new HTTPException(403, { message: '403 - Resource already exists' });
	}

	return db.insert(external_saved).values({ user_id, event_id }).returning();
};

export const removeExternalSaved = async (connectionStr: string, user_id: string, event_id: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);

	const deletedEvent = await db
		.delete(external_saved)
		.where(and(eq(external_saved.user_id, user_id), eq(external_saved.event_id, event_id)))
		.returning();

	if (deletedEvent.length == 0) {
		throw new HTTPException(404, { message: '404 - Saved event not found' });
	}
	return deletedEvent;
};
