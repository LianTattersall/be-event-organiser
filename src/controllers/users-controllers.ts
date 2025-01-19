import { Context } from 'hono';
import { Env } from '../index';
import { fetchUserById } from '../models/users-models';
import { connectionStr } from './utils';

export const getUserById = async (c: Context<{ Bindings: Env }>) => {
	const user_id = c.req.param('user_id');
	try {
		const user = await fetchUserById(Number(user_id), connectionStr(c)!);
		return c.json({ user });
	} catch (err) {
		return c.json(err!, 404);
	}
};
