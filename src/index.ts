import { Hono } from 'hono';
import endpoints from './endpoints.json';
import users_routes from './routes/users-routes';
import { HTTPException } from 'hono/http-exception';
import { NeonDbError } from '@neondatabase/serverless';
import { ContentlessStatusCode } from 'hono/utils/http-status';
import events_routes from './routes/events-routes';

export type Env = {
	DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
	return c.json({ endpoints }, 200);
});

app.route('/users', users_routes);

app.route('/events', events_routes);

app.onError((err, c) => {
	console.log(err);
	if (err instanceof HTTPException) {
		return c.json({ message: err.message }, err.status);
	} else if (err instanceof NeonDbError) {
		if (err.code == '23505') {
			return c.json({ message: '403 - Resource already exists' }, 403);
		}
	}

	return c.json({ message: '500 - Internal server error' }, 500);
});

export default app;
