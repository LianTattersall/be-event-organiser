import { Context } from 'hono';
import { Env } from '../index';
import axios from 'axios';

export const getTicketMaster = async (c: Context<{ Bindings: Env }>) => {
	let requestStr = `https://app.ticketmaster.com/discovery/v2`;

	const path = c.req.routePath.split('/');

	for (let i = 2; i < path.length; i++) {
		if (c.req.param(path[i].slice(1, path[i].length))) {
			requestStr += '/' + c.req.param(path[i].slice(1, path[i].length));
		} else {
			requestStr += '/' + path[i];
		}
	}

	requestStr += `?apikey=${c.env.TICKET_MASTER_KEY}`;
	const queries = c.req.queries();
	for (const key in queries) {
		requestStr += `&${key}=${queries[key][0]}`;
	}

	const data = await axios.get(requestStr);

	return c.json(data);
};
