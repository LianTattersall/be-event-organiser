import { Context } from 'hono';
import {
	addEvent,
	fetchEventById,
	fetchEvents,
	fetchEventSignups,
	fetchOrganisersEvents,
	removeEventById,
	updateEvent,
} from '../models/events-models';
import { connectionStr } from './utils';
import { Env } from '../index';

export const getEvents = async (c: Context<{ Bindings: Env }>) => {
	const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 10;
	const p = c.req.query('p') ? Number(c.req.query('p')) : 1;
	const sortby = c.req.query('sortby') || 'id';
	const orderby = c.req.query('orderby') || 'asc';
	const type = c.req.query('type') || 'all';
	const searchTerm = c.req.query('searchTerm') || '';

	const events = await fetchEvents(connectionStr(c)!, limit, p, sortby, orderby, type, searchTerm);
	return c.json({ events });
};

export const getEventById = async (c: Context<{ Bindings: Env }>) => {
	const event_id = c.req.param('event_id');
	const event = await fetchEventById(connectionStr(c)!, Number(event_id));
	return c.json({ event });
};

export const deleteEventById = async (c: Context<{ Bindings: Env }>) => {
	const event_id = c.req.param('event_id');
	await removeEventById(connectionStr(c)!, Number(event_id));
	return c.body(null, 204);
};

export const postEvent = async (c: Context<{ Bindings: Env }>) => {
	const eventToPost = await c.req.json();
	const event = await addEvent(connectionStr(c)!, eventToPost);
	return c.json({ event }, 201);
};

export const getEventSignups = async (c: Context<{ Bindings: Env }>) => {
	const event_id = c.req.param('event_id');
	const searchTerm = c.req.query('searchTerm') || '';
	const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 10;
	const p = c.req.query('p') ? Number(c.req.query('p')) : 1;

	const signedUpUsers = await fetchEventSignups(connectionStr(c)!, Number(event_id), searchTerm, Number(p), Number(limit));
	return c.json({ users: signedUpUsers });
};

export const getOrganisersEvents = async (c: Context<{ Bindings: Env }>) => {
	const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 10;
	const p = c.req.query('p') ? Number(c.req.query('p')) : 1;
	const type = c.req.query('type') || '';
	const user_id = c.req.param('organiser_id');
	const events = await fetchOrganisersEvents(connectionStr(c)!, Number(user_id), Number(p), Number(limit), type);
	return c.json({ events });
};

export const patchEvent = async (c: Context<{ Bindings: Env }>) => {
	const event_id = c.req.param('event_id');
	const patchInfo = await c.req.json();

	const event = await updateEvent(connectionStr(c)!, Number(event_id), patchInfo);
	return c.json({ event });
};
