import { Context, Next } from 'hono';
import { Env } from '../index';
import { addUser, fetchUserById } from '../models/users-models';
import { connectionStr } from './utils';
import { HTTPException } from 'hono/http-exception';

export const getUserById = async (c: Context<{ Bindings: Env }>) => {
	const user_id = c.req.param('user_id');
	const user = await fetchUserById(Number(user_id), connectionStr(c)!);
	return c.json({ user });
};

export const postUser = async (c: Context<{ Bindings: Env }>) => {
	const userDetails = await c.req.json();
	const user = await addUser(userDetails, connectionStr(c)!);
	return c.json({ user }, 201);
};
