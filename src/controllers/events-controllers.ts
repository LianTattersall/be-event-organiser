import { Context } from 'hono';
import { fetchEventById, fetchEvents, removeEventById } from '../models/events-models';
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
