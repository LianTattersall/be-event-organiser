import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const fetchUserById = async (user_id: number, connectionStr: string) => {
	const neon_sql = neon(connectionStr);
	const db = drizzle(neon_sql);
	const user_data = await db.select().from(users).where(eq(users.user_id, user_id));
	return user_data.length == 0 ? Promise.reject({ message: '404 - User not found' }) : user_data[0];
};
