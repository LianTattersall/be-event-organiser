import { Hono } from 'hono';
import endpoints from './endpoints.json';
import users_routes from './routes/users-routes';
import { HTTPException } from 'hono/http-exception';
import { NeonDbError } from '@neondatabase/serverless';
import { ContentlessStatusCode } from 'hono/utils/http-status';
import events_routes from './routes/events-routes';

export type Env = {
	DATABASE_URL: string;
	DATABASE_URL_TEST: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
	return c.json({ endpoints }, 200);
});

app.route('/users', users_routes);

app.route('/events', events_routes);

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return c.json({ message: err.message }, err.status);
	} else if (err instanceof NeonDbError) {
		if (err.code == '23505') {
			return c.json({ message: '403 - Resource already exists' }, 403);
		}
		if (err.code == '22007') {
			return c.json({ message: '400 - Invalid syntax for date/time' }, 400);
		}
		if (err.code == '23502') {
			return c.json({ message: '400 - Missing information on request body' }, 400);
		}
		if (err.code == '22P02') {
			return c.json({ message: '400 - Invalid data type' }, 400);
		}
		if (err.code == '23503') {
			return c.json({ message: '404 - Resource not found' }, 404);
		}
	}
	console.log(err);
	return c.json({ message: '500 - Internal server error' }, 500);
});

export default app;
