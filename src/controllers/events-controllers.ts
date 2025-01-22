import { Context } from 'hono';
import { fetchEvents } from '../models/events-models';
import { connectionStr } from './utils';
import { Env } from '../index';
import { HTTPException } from 'hono/http-exception';

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
