import { Context } from 'hono';
import { Env } from '../index';
import { addExternalSaved, fetchExternalSavedEvents, removeExternalSaved } from '../models/external-models';
import { connectionStr } from './utils';

export const getExternalSavedEvents = async (c: Context<{ Bindings: Env }>) => {
	const events = await fetchExternalSavedEvents(connectionStr(c)!, c.req.param('user_id'));

	return c.json({ events });
};

export const postExternalSaved = async (c: Context<{ Bindings: Env }>) => {
	const { event_id } = await c.req.json();
	const saved = await addExternalSaved(connectionStr(c)!, c.req.param('user_id'), event_id);

	return c.json({ saved: saved[0] }, 201);
};

export const deleteExternalSaved = async (c: Context<{ Bindings: Env }>) => {
	await removeExternalSaved(connectionStr(c)!, c.req.param('user_id'), c.req.param('event_id'));
	return c.body(null, 204);
};
