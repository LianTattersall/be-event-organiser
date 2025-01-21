import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
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
