import { Context, Next } from 'hono';
import { Env } from '../index';
import {
	addSavedByUserId,
	addSignupByUserId,
	addUser,
	fetchSavedByUserId,
	fetchSignupsByUserId,
	fetchUserById,
	removeSaved,
	removeSignup,
	removeUserById,
} from '../models/users-models';
import { connectionStr } from './utils';
import { HTTPException } from 'hono/http-exception';

export const getUserById = async (c: Context<{ Bindings: Env }>) => {
	const user_id = c.req.param('user_id');
	const user = await fetchUserById(user_id, connectionStr(c)!);
	return c.json({ user });
};

export const postUser = async (c: Context<{ Bindings: Env }>) => {
	const userDetails = await c.req.json();
	const user = await addUser(userDetails, connectionStr(c)!);
	return c.json({ user }, 201);
};

export const deleteUserById = async (c: Context<{ Bindings: Env }>) => {
	const user_id = c.req.param('user_id');
	await removeUserById(user_id, connectionStr(c)!);
	return c.body(null, 204);
};

export const getSignupsByUserId = async (c: Context<{ Bindings: Env }>) => {
	const user_id = c.req.param('user_id');
	const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 10;
	const p = c.req.query('p') ? Number(c.req.query('p')) : 1;
	const type = c.req.query('type') || '';

	const signups = await fetchSignupsByUserId(connectionStr(c)!, user_id, Number(limit), Number(p), type);
	return c.json({ signups });
};

export const postSignupByUserId = async (c: Context<{ Bindings: Env }>) => {
	const user_id = c.req.param('user_id');
	const { event_id } = await c.req.json();
	const signup = await addSignupByUserId(connectionStr(c)!, user_id, event_id);
	return c.json({ signup }, 201);
};

export const deleteSignup = async (c: Context<{ Bindings: Env }>) => {
	const user_id = c.req.param('user_id');
	const event_id = c.req.param('event_id');

	await removeSignup(connectionStr(c)!, user_id, Number(event_id));

	return c.body(null, 204);
};

export const getSavedByUserId = async (c: Context<{ Bindings: Env }>) => {
	const user_id = c.req.param('user_id');
	const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 10;
	const p = c.req.query('p') ? Number(c.req.query('p')) : 1;
	const type = c.req.query('type') || '';

	const saved = await fetchSavedByUserId(connectionStr(c)!, user_id, Number(limit), Number(p), type);
	return c.json({ saved });
};

export const postSavedByUserId = async (c: Context<{ Bindings: Env }>) => {
	const user_id = c.req.param('user_id');
	const { event_id } = await c.req.json();
	const saved = await addSavedByUserId(connectionStr(c)!, user_id, event_id);
	return c.json({ saved }, 201);
};

export const deleteSaved = async (c: Context<{ Bindings: Env }>) => {
	const user_id = c.req.param('user_id');
	const event_id = c.req.param('event_id');

	await removeSaved(connectionStr(c)!, user_id, Number(event_id));

	return c.body(null, 204);
};
